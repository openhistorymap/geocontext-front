/// <reference path="./citation-js.d.ts" />
import { Component, computed, input, signal } from '@angular/core';
import { cffToCsl, CslEntry } from './cff-to-csl';

/**
 * One row in the export-format dropdown. `format` and `template` are
 * passed through to citation.js's `Cite.format(format, options)`. `data`
 * means CSL-JSON output.
 */
interface ExportOption {
  id: string;
  label: string;
  ext: string;
  mime: string;
  format: 'bibliography' | 'data' | 'bibtex' | 'biblatex' | 'ris';
  template?: string;
}

const EXPORTS: ExportOption[] = [
  { id: 'apa',       label: 'APA',         ext: 'txt',  mime: 'text/plain',                          format: 'bibliography', template: 'apa' },
  { id: 'vancouver', label: 'Vancouver',   ext: 'txt',  mime: 'text/plain',                          format: 'bibliography', template: 'vancouver' },
  { id: 'harvard',   label: 'Harvard',     ext: 'txt',  mime: 'text/plain',                          format: 'bibliography', template: 'harvard1' },
  { id: 'bibtex',    label: 'BibTeX',      ext: 'bib',  mime: 'application/x-bibtex',                format: 'bibtex' },
  { id: 'biblatex',  label: 'BibLaTeX',    ext: 'bib',  mime: 'application/x-bibtex',                format: 'biblatex' },
  { id: 'ris',       label: 'RIS',         ext: 'ris',  mime: 'application/x-research-info-systems', format: 'ris' },
  { id: 'csl',       label: 'CSL-JSON',    ext: 'json', mime: 'application/json',                    format: 'data' },
];

/**
 * Lazy-loaded citation.js. The plugin imports register themselves on
 * citation.js's global registry via side effects, so we keep references
 * to the modules to prevent any future tree-shaker from dropping them.
 * Loading is gated behind first use, so consumers that never hit a CFF
 * page don't pay for the ~700 kB CSL templates.
 */
let citePromise: Promise<{ Cite: any }> | null = null;
function loadCite(): Promise<{ Cite: any }> {
  if (!citePromise) {
    citePromise = (async () => {
      const [coreMod, csl, bibtex, ris] = await Promise.all([
        import('@citation-js/core'),
        import('@citation-js/plugin-csl'),
        import('@citation-js/plugin-bibtex'),
        import('@citation-js/plugin-ris'),
      ]);
      void csl; void bibtex; void ris;
      return { Cite: (coreMod as any).Cite ?? (coreMod as any).default?.Cite };
    })();
  }
  return citePromise;
}

/**
 * Renders a CITATION.cff (passed as raw YAML text) as a structured
 * citation block with a format dropdown. citation.js converts the
 * derived CSL-JSON to APA / Vancouver / Harvard / BibTeX / BibLaTeX /
 * RIS / raw CSL-JSON; users can copy the output or download it as a
 * file with the appropriate extension.
 */
@Component({
  selector: 'chcx-citation',
  standalone: true,
  template: `
    <article class="chcx-citation">
      <header class="chcx-citation-header">
        <h1 class="chcx-citation-title">{{ title() }}</h1>
        @if (authorsLine(); as a) {
          <p class="chcx-citation-authors">{{ a }}</p>
        }
        @if (metaLine(); as m) {
          <p class="chcx-citation-meta">{{ m }}</p>
        }
      </header>

      @if (abstractText(); as ab) {
        <p class="chcx-citation-abstract">{{ ab }}</p>
      }

      <section class="chcx-citation-cite">
        <header class="chcx-citation-cite-header">
          <h2>How to cite</h2>
          <div class="chcx-citation-controls">
            <label>
              <span class="chcx-citation-controls-label">Format</span>
              <select [value]="exportId()" (change)="onFormatChange($event)">
                @for (opt of options; track opt.id) {
                  <option [value]="opt.id">{{ opt.label }}</option>
                }
              </select>
            </label>
            <button type="button" (click)="copy()" [disabled]="!ready()">{{ copyLabel() }}</button>
            <button type="button" (click)="download()" [disabled]="!ready()">Download</button>
          </div>
        </header>
        <pre class="chcx-citation-output"><code>{{ formatted() }}</code></pre>
        @if (errorMsg(); as e) {
          <p class="chcx-citation-error">{{ e }}</p>
        }
      </section>

      @if (links().length) {
        <p class="chcx-citation-links">
          @for (link of links(); track link.url) {
            <a [href]="link.url" rel="noopener">{{ link.label }}</a>
          }
        </p>
      }

      <details class="chcx-citation-raw">
        <summary>Raw CITATION.cff</summary>
        <pre><code>{{ yaml() }}</code></pre>
      </details>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 24px;
        max-width: 900px;
        margin: 0 auto;
        color: var(--gcx-ink);
      }
      .chcx-citation { line-height: 1.5; }
      .chcx-citation-header { margin-bottom: 1.25rem; }
      .chcx-citation-title { margin: 0 0 0.25rem 0; font-size: 1.6rem; color: var(--gcx-ink); }
      .chcx-citation-authors { margin: 0.25rem 0; font-size: 1rem; color: var(--gcx-ink); }
      .chcx-citation-meta { margin: 0.25rem 0; color: var(--gcx-ink-soft); font-size: 0.9rem; }
      .chcx-citation-abstract { font-style: italic; color: var(--gcx-ink-soft); margin: 1rem 0; }
      .chcx-citation-cite-header {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }
      .chcx-citation-cite-header h2 {
        font-size: 0.85rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--gcx-ink-soft);
        margin: 0;
      }
      .chcx-citation-controls {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        font-size: 0.9rem;
      }
      .chcx-citation-controls label { display: inline-flex; align-items: center; gap: 0.4rem; }
      .chcx-citation-controls-label { color: var(--gcx-ink-soft); }
      .chcx-citation-controls select,
      .chcx-citation-controls button {
        font: inherit;
        padding: 4px 8px;
        border: 1px solid var(--gcx-rule);
        background: var(--gcx-paper-soft);
        color: var(--gcx-ink);
        border-radius: 2px;
        cursor: pointer;
      }
      .chcx-citation-controls button:hover:not(:disabled),
      .chcx-citation-controls select:hover {
        border-color: var(--gcx-rule-strong);
      }
      .chcx-citation-controls button:disabled { opacity: 0.5; cursor: default; }
      .chcx-citation-output {
        background: var(--gcx-paper-soft);
        color: var(--gcx-ink);
        padding: 12px 14px;
        margin-top: 0.5rem;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.88rem;
        border: 1px solid var(--gcx-rule);
      }
      .chcx-citation-output code { font-family: inherit; color: inherit; }
      .chcx-citation-links { margin-top: 1rem; }
      .chcx-citation-links a { margin-right: 0.75rem; }
      .chcx-citation-raw { margin-top: 1.25rem; }
      .chcx-citation-raw summary { color: var(--gcx-ink-soft); cursor: pointer; }
      .chcx-citation-raw pre {
        background: var(--gcx-paper-soft);
        color: var(--gcx-ink);
        padding: 12px 14px;
        overflow-x: auto;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.85rem;
        border: 1px solid var(--gcx-rule);
      }
      .chcx-citation-error {
        color: var(--gcx-accent-deep);
        font-style: italic;
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class ChcxCitationComponent {
  readonly yaml = input.required<string>();
  readonly options = EXPORTS;
  readonly exportId = signal<string>('apa');
  readonly copyLabel = signal('Copy');

  private readonly _runtimeError = signal<string>('');
  private readonly citeApi = signal<{ Cite: any } | null>(null);

  readonly cslResult = computed<{ ok: true; value: CslEntry } | { ok: false; error: string }>(() => {
    try {
      return { ok: true, value: cffToCsl(this.yaml()) };
    } catch (e: any) {
      return { ok: false, error: `Invalid CITATION.cff: ${e?.message ?? String(e)}` };
    }
  });

  readonly csl = computed<CslEntry | null>(() => {
    const r = this.cslResult();
    return r.ok ? r.value : null;
  });

  readonly title = computed(() => this.csl()?.title ?? 'Untitled work');

  readonly authorsLine = computed(() => {
    const a = this.csl()?.author ?? [];
    if (!a.length) return null;
    return a
      .map((x) => x.literal ?? [x.given, x.family].filter(Boolean).join(' '))
      .filter((s): s is string => !!s)
      .join(', ');
  });

  readonly metaLine = computed(() => {
    const c = this.csl();
    if (!c) return null;
    const parts: string[] = [];
    const dp = c.issued?.['date-parts']?.[0];
    if (dp?.[0]) parts.push(String(dp[0]));
    if (c.version) parts.push(`v${c.version}`);
    if (c.note) parts.push(c.note.replace(/^License:\s*/, ''));
    return parts.length ? parts.join(' · ') : null;
  });

  readonly abstractText = computed(() => this.csl()?.abstract ?? null);

  readonly links = computed<{ url: string; label: string }[]>(() => {
    const c = this.csl();
    if (!c) return [];
    const out: { url: string; label: string }[] = [];
    if (c.DOI) out.push({ url: `https://doi.org/${c.DOI}`, label: `doi:${c.DOI}` });
    if (c.URL) out.push({ url: c.URL, label: c.URL });
    return out;
  });

  readonly ready = computed(() => this.citeApi() !== null && this.csl() !== null);

  readonly formatted = computed(() => {
    const api = this.citeApi();
    if (!api) return 'Loading citation engine…';
    const csl = this.csl();
    if (!csl) return '';
    const opt = this.options.find((o) => o.id === this.exportId());
    if (!opt) return '';
    try {
      const cite = new api.Cite(csl);
      if (opt.format === 'bibliography') {
        return String(
          cite.format('bibliography', { format: 'text', template: opt.template, lang: 'en-US' }),
        ).trim();
      }
      if (opt.format === 'data') {
        return JSON.stringify(JSON.parse(String(cite.format('data'))), null, 2);
      }
      return String(cite.format(opt.format)).trim();
    } catch (e: any) {
      queueMicrotask(() => this._runtimeError.set(`Could not format: ${e?.message ?? String(e)}`));
      return '';
    }
  });

  readonly errorMsg = computed(() => {
    const r = this.cslResult();
    if (!r.ok) return r.error;
    return this._runtimeError();
  });

  constructor() {
    loadCite()
      .then((api) => this.citeApi.set(api))
      .catch((e: any) =>
        this._runtimeError.set(`Could not load citation engine: ${e?.message ?? String(e)}`),
      );
  }

  onFormatChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value;
    this.exportId.set(v);
    this._runtimeError.set('');
  }

  async copy(): Promise<void> {
    const text = this.formatted();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      this.copyLabel.set('Copied');
      setTimeout(() => this.copyLabel.set('Copy'), 1500);
    } catch (e: any) {
      this._runtimeError.set(`Could not copy: ${e?.message ?? String(e)}`);
    }
  }

  download(): void {
    const text = this.formatted();
    const opt = this.options.find((o) => o.id === this.exportId());
    if (!text || !opt) return;
    const filename = `${this.csl()?.id ?? 'citation'}.${opt.ext}`;
    const blob = new Blob([text], { type: opt.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
