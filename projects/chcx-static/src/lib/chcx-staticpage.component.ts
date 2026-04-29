import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GcxCoreService } from '@openhistorymap/gcx-core';
import { ChcxStaticService, ChcxStaticPage } from './chcx-static.service';
import { ChcxCitationComponent } from './chcx-citation.component';
import { ChcxFormat, inferFormatFromUrl, renderPayload } from './chcx-render';

/**
 * Renders a single static page identified by route param `:name`. Looks up
 * the entry in the registry (loaded by `ChcxStaticService`); for
 * `mode: 'file'` entries, fetches the URL and renders according to the
 * page's `format`:
 *   - html / markdown → injected as HTML (markdown via `marked`).
 *   - cff → handed to `<chcx-citation>`, which uses citation.js to expose
 *     interactive APA / BibTeX / RIS / etc. exports.
 *
 * Trust model: html/markdown HTML is injected via
 * DomSanitizer.bypassSecurityTrustHtml because the registry comes from
 * the same repo as the deployed app or a public repo the user is
 * intentionally browsing. Don't render untrusted external chcx-static.json
 * files through this component.
 */
@Component({
  selector: 'chcx-staticpage',
  standalone: true,
  imports: [ChcxCitationComponent],
  template: `
    @if (status() === 'ready') {
      @if (format() === 'cff') {
        <chcx-citation [yaml]="rawText()" />
      } @else {
        <article
          class="chcx-static-content"
          [class]="'chcx-static-format-' + format()"
          [innerHTML]="html()"
        ></article>
      }
    } @else if (status() === 'missing') {
      <div class="chcx-static-msg chcx-static-error">
        <strong>Page not found:</strong> {{ name() }}
      </div>
    } @else if (status() === 'error') {
      <div class="chcx-static-msg chcx-static-error">
        <strong>Could not load page:</strong> {{ message() }}
      </div>
    } @else {
      <div class="chcx-static-msg">Loading {{ name() }}…</div>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .chcx-static-content { padding: 24px; max-width: 900px; margin: 0 auto; }
      .chcx-static-msg { padding: 24px; max-width: 900px; margin: 0 auto; }
      .chcx-static-error { color: #b00020; }

      .chcx-static-format-markdown :is(h1, h2, h3) { line-height: 1.2; }
      .chcx-static-format-markdown pre {
        background: #f6f6f4;
        padding: 12px 14px;
        overflow-x: auto;
        border-radius: 2px;
      }
      .chcx-static-format-markdown code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.92em;
      }
      .chcx-static-format-markdown blockquote {
        border-left: 3px solid #ccc;
        margin: 1em 0;
        padding: 0 1em;
        color: #555;
      }
      .chcx-static-format-markdown img { max-width: 100%; height: auto; }
    `,
  ],
})
export class ChcxStaticpageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly gcx = inject(GcxCoreService);
  private readonly registry = inject(ChcxStaticService);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  readonly name = signal('');
  readonly status = signal<'loading' | 'ready' | 'missing' | 'error'>('loading');
  readonly html = signal<SafeHtml | null>(null);
  readonly rawText = signal<string>('');
  readonly format = signal<ChcxFormat>('html');
  readonly message = signal('');

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (params) => {
        const name = params.get('name') ?? '';
        const user = params.get('user');
        const project = params.get('project');
        this.name.set(name);
        this.status.set('loading');

        if (user && project && this.gcx.currentRepo()?.user !== user) {
          this.gcx.load({ user, project }).catch(() => {
            // gcx.json absent in repo is fine — we still have repo context.
          });
        }

        try {
          await this.registry.load();
          const page = this.registry.get(name);
          if (!page) {
            this.status.set('missing');
            return;
          }
          await this.render(page);
        } catch (err: any) {
          this.status.set('error');
          this.message.set(err?.message ?? String(err));
        }
      });
  }

  private async render(page: ChcxStaticPage): Promise<void> {
    const text = page.mode === 'raw'
      ? page.content
      : await firstValueFrom(this.http.get(page.content, { responseType: 'text' }));
    const fmt: ChcxFormat = page.format
      ?? (page.mode === 'file' ? inferFormatFromUrl(page.content) : 'html');
    this.format.set(fmt);
    if (fmt === 'cff') {
      this.rawText.set(text);
      this.html.set(null);
    } else {
      this.rawText.set('');
      this.html.set(this.sanitizer.bypassSecurityTrustHtml(renderPayload(text, fmt)));
    }
    this.status.set('ready');
  }
}
