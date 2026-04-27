import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GcxCoreService } from '@openhistorymap/gcx-core';
import { ChcxStaticService } from './chcx-static.service';

/**
 * Renders a single static page identified by route param `:name`. Looks up
 * the entry in `chcx-static.json` (loaded by `ChcxStaticService`); for
 * `mode: 'file'` entries, fetches the referenced URL and injects the
 * response as HTML. Works at both `/static/:name` (local) and
 * `/:user/:project/static/:name` (repo) — `ChcxStaticService` picks the
 * source automatically.
 *
 * Trust model: HTML payloads are trusted via DomSanitizer.bypassSecurityTrustHtml
 * because the registry comes from the same repo as the deployed app or
 * from a public repo the user is intentionally browsing. Don't render
 * untrusted external chcx-static.json files through this component.
 */
@Component({
  selector: 'chcx-staticpage',
  standalone: true,
  template: `
    @if (status() === 'ready') {
      <article class="chcx-static-content" [innerHTML]="html()"></article>
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

        // When mounted under :user/:project/static/:name, point the global
        // repo context at that repo so ChcxStaticService loads the repo's
        // chcx-static.json. gcx.load sets currentRepo synchronously even
        // before its fetch resolves, so we don't have to await it.
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
          if (page.mode === 'raw') {
            this.html.set(this.sanitizer.bypassSecurityTrustHtml(page.content));
            this.status.set('ready');
          } else if (page.mode === 'file') {
            const text = await firstValueFrom(
              this.http.get(page.content, { responseType: 'text' }),
            );
            this.html.set(this.sanitizer.bypassSecurityTrustHtml(text));
            this.status.set('ready');
          } else {
            this.status.set('error');
            this.message.set(`Unknown mode "${(page as any).mode}"`);
          }
        } catch (err: any) {
          this.status.set('error');
          this.message.set(err?.message ?? String(err));
        }
      });
  }
}
