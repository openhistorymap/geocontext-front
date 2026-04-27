import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GcxCoreService, GCX_JSDELIVR_BASE } from '@openhistorymap/gcx-core';

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

export interface ChcxStaticPage {
  target: string;
  title?: string;
  icon?: string;
  /** `'file'` → fetch the URL in `content` and inject as HTML; `'raw'` →
   * inject `content` as HTML directly. */
  mode: 'file' | 'raw';
  content: string;
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
    this._pending = this.fetchFirstAvailable(candidates).then((pages) => {
      this._pages.set(pages);
      return pages;
    });
    return this._pending;
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
}
