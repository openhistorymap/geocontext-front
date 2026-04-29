import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GcxCoreService, GCX_JSDELIVR_BASE } from '@openhistorymap/gcx-core';
import { ChcxFormat, inferFormatFromUrl } from './chcx-render';

export const CHCX_STATIC_FILE = '/assets/chcx-static.json';

/**
 * Filenames probed at the repo root when GcxCoreService.currentRepo() is
 * set. `geocontext-static.json` is the preferred (modern) name; the legacy
 * `chcx-static.json` is kept for backwards compatibility with older repos.
 * Mirrors GCX_REPO_CANDIDATE_PATHS in @openhistorymap/gcx-core.
 */
export const CHCX_STATIC_CANDIDATE_PATHS = [
  'geocontext-static.json',
  'chcx-static.json',
] as const;

/**
 * Repo-root files auto-registered as static pages when present. Each entry
 * is HEAD-probed against jsdelivr after the registry loads; on 200 it is
 * merged into the registry (without overwriting any existing slug from
 * chcx-static.json). The slug is what appears in the URL and toolbar.
 */
const CHCX_AUTO_DISCOVER: ReadonlyArray<{
  slug: string;
  title: string;
  path: string;
  format: ChcxFormat;
}> = [
  { slug: 'readme', title: 'README', path: '/README.md', format: 'markdown' },
  { slug: 'citation', title: 'Citation', path: '/CITATION.cff', format: 'cff' },
];

export interface ChcxStaticPage {
  target: string;
  title?: string;
  icon?: string;
  /** `'file'` → fetch the URL in `content`; `'raw'` → use `content` directly. */
  mode: 'file' | 'raw';
  content: string;
  /** Render format. Defaults inferred from URL extension on `mode: 'file'`
   *  pages (.md → markdown, .cff → cff, otherwise html) and `'html'` on
   *  `mode: 'raw'`. Override here when the URL is extensionless or when
   *  raw content is markdown / CITATION.cff YAML. */
  format?: ChcxFormat;
}

/**
 * Loads the static-page registry once and caches by source URL. Two modes:
 *
 *   - **local**: single candidate `/assets/chcx-static.json`.
 *   - **repo**: when GcxCoreService.currentRepo() is set, probes
 *     `geocontext-static.json` first then falls back to `chcx-static.json`
 *     via jsdelivr — non-404 errors propagate immediately so real
 *     CORS/server failures aren't masked. If both 404, the registry
 *     resolves to an empty map (legitimate "no static pages").
 *
 * In repo mode the service also probes `README.md` and `CITATION.cff` at
 * the repo root and registers them under the `readme` / `citation` slugs
 * if present, unless chcx-static.json already claims those slugs.
 *
 * Repo mode is picked up automatically — the gcx-core map route already
 * sets `currentRepo` when the URL is `/:user/:project/map`, and
 * ChcxStaticpageComponent does the same when it sees those route params.
 */
@Injectable({ providedIn: 'root' })
export class ChcxStaticService {
  private readonly http = inject(HttpClient);
  private readonly gcx = inject(GcxCoreService);

  private readonly _pages = signal<Record<string, ChcxStaticPage> | null>(null);
  readonly pages = this._pages.asReadonly();

  private _loadedFor: string | null = null;
  private _pending: Promise<Record<string, ChcxStaticPage>> | null = null;

  /** Lazily load the static-page registry. Re-fetches when the source URL
   *  changes (e.g. navigating between repos). */
  async load(): Promise<Record<string, ChcxStaticPage>> {
    const candidates = this.candidateUrls();
    const cacheKey = candidates[0];
    const cached = this._pages();
    if (this._loadedFor === cacheKey && cached) return cached;

    this._loadedFor = cacheKey;
    this._pending = (async () => {
      const pages = await this.fetchFirstAvailable(candidates);
      const resolved = this.rewriteContentUrls(pages);
      const merged = await this.mergeAutoDiscovered(resolved);
      this._pages.set(merged);
      return merged;
    })();
    return this._pending;
  }

  /**
   * Rewrites every `mode: 'file'` page's `content` URL through
   * `GcxCoreService.resolveAssetUrl`, so:
   *   - `/assets/about.html` in repo mode → jsdelivr current-repo's asset
   *   - `/<user>/<project>/assets/about.html` → jsdelivr that repo's asset
   *   - absolute http(s) URLs → unchanged
   * `mode: 'raw'` entries are left alone. Format is inferred from the
   * resolved URL when not already set, so chcx-static.json doesn't need
   * to spell out `format: 'markdown'` for a `.md` link.
   */
  private rewriteContentUrls(
    pages: Record<string, ChcxStaticPage>,
  ): Record<string, ChcxStaticPage> {
    const out: Record<string, ChcxStaticPage> = {};
    for (const [key, page] of Object.entries(pages)) {
      if (page?.mode === 'file' && typeof page.content === 'string') {
        const content = this.gcx.resolveAssetUrl(page.content);
        const format = page.format ?? inferFormatFromUrl(content);
        out[key] = { ...page, content, format };
      } else {
        out[key] = page;
      }
    }
    return out;
  }

  /** All registered pages as an array (for toolbar items, sidebars, …). */
  list(): ChcxStaticPage[] {
    const pages = this._pages() ?? {};
    return Object.values(pages);
  }

  /** Look up a page by `target` slug. Returns `null` if the registry isn't
   *  loaded yet or the slug is unknown. */
  get(target: string): ChcxStaticPage | null {
    const pages = this._pages();
    if (!pages) return null;
    return pages[target] ?? null;
  }

  private candidateUrls(): string[] {
    const repo = this.gcx.currentRepo();
    if (!repo) return [CHCX_STATIC_FILE];
    const branch = repo.branch ?? 'HEAD';
    const base = `${GCX_JSDELIVR_BASE}/${repo.user}/${repo.project}@${branch}`;
    return CHCX_STATIC_CANDIDATE_PATHS.map((p) => `${base}/${p}`);
  }

  private async fetchFirstAvailable(
    urls: string[],
  ): Promise<Record<string, ChcxStaticPage>> {
    let last404: any;
    for (const url of urls) {
      try {
        const pages = await firstValueFrom(
          this.http.get<Record<string, ChcxStaticPage>>(url),
        );
        return pages ?? {};
      } catch (e: any) {
        if (e?.status === 404) {
          last404 = e;
          continue;
        }
        throw e;
      }
    }
    // All candidates 404'd — legitimate "no static pages defined".
    return {};
  }

  /**
   * In repo mode, probe well-known repo-root files (README.md, CITATION.cff)
   * and register them under default slugs when present. Authored entries
   * win: a chcx-static.json with `readme:` or `citation:` keeps its content,
   * and any entry already pointing at the same content URL is left alone.
   * In local mode this is a no-op.
   */
  private async mergeAutoDiscovered(
    pages: Record<string, ChcxStaticPage>,
  ): Promise<Record<string, ChcxStaticPage>> {
    const repo = this.gcx.currentRepo();
    if (!repo) return pages;

    const existingUrls = new Set(
      Object.values(pages)
        .filter((p): p is ChcxStaticPage => p?.mode === 'file' && typeof p.content === 'string')
        .map((p) => p.content),
    );

    const probes = await Promise.all(
      CHCX_AUTO_DISCOVER.map(async (entry) => {
        if (pages[entry.slug]) return null;
        const url = this.gcx.resolveAssetUrl(entry.path);
        if (existingUrls.has(url)) return null;
        const ok = await this.exists(url);
        if (!ok) return null;
        return [entry.slug, {
          target: entry.slug,
          title: entry.title,
          mode: 'file' as const,
          content: url,
          format: entry.format,
        }] as const;
      }),
    );

    const out = { ...pages };
    for (const probe of probes) {
      if (!probe) continue;
      const [slug, page] = probe;
      out[slug] = page;
    }
    return out;
  }

  private async exists(url: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.head(url, { observe: 'response' }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
