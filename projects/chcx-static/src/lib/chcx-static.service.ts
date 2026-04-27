import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GcxCoreService, GCX_JSDELIVR_BASE } from '@openhistorymap/gcx-core';

export const CHCX_STATIC_FILE = '/assets/chcx-static.json';

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
 * Loads `chcx-static.json` once and caches by source URL. Two source modes:
 *
 *   - **local**: defaults to `/assets/chcx-static.json`.
 *   - **repo**: when GcxCoreService.currentRepo() is set, fetches
 *     `chcx-static.json` from the same repo via jsdelivr.
 *
 * Repo mode is picked up automatically — the gcx-core map route already
 * sets `currentRepo` when the URL is `/:user/:project/map`, and the static
 * route inherits the same context.
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
    const url = this.sourceUrl();
    const cached = this._pages();
    if (this._loadedFor === url && cached) return cached;

    this._loadedFor = url;
    this._pending = firstValueFrom(this.http.get<Record<string, ChcxStaticPage>>(url))
      .then((pages) => {
        this._pages.set(pages ?? {});
        return pages ?? {};
      })
      .catch((err) => {
        // Missing chcx-static.json is normal in repo mode; expose empty list.
        if (err?.status === 404) {
          this._pages.set({});
          return {};
        }
        throw err;
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

  private sourceUrl(): string {
    const repo = this.gcx.currentRepo();
    if (!repo) return CHCX_STATIC_FILE;
    const branch = repo.branch ?? 'HEAD';
    return `${GCX_JSDELIVR_BASE}/${repo.user}/${repo.project}@${branch}/chcx-static.json`;
  }
}
