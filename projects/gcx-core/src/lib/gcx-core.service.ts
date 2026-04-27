import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export const GCX_CORE_FILE = '/assets/gcx.json';
export const GCX_JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh';

export interface GcxConfig {
  title?: string;
  type?: string;
  center?: [number, number] | { lat: number; lon: number };
  minzoom?: number;
  startzoom?: number;
  maxzoom?: number;
  search?: boolean;
  datasources?: any[];
  layers?: any[];
  [k: string]: any;
}

/** Identifies a public GitHub repo and which `geocontext.json` to load from it. */
export interface GcxRepoSource {
  user: string;
  project: string;
  branch?: string;
  path?: string;
}

/** Either a plain URL (legacy /assets/gcx.json mode) or a repo descriptor. */
export type GcxLoadSource = string | GcxRepoSource;

@Injectable({ providedIn: 'root' })
export class GcxCoreService {
  private readonly http = inject(HttpClient);

  readonly sidebarOpen = signal(false);
  readonly currentRepo = signal<GcxRepoSource | null>(null);

  private readonly _config = signal<GcxConfig | null>(null);
  /** Currently loaded config, reactively. `null` until `load()` resolves. */
  readonly config = this._config.asReadonly();

  private _pending: Promise<GcxConfig> | null = null;
  private _loadedFor: string | null = null;

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }
  openSidebar(): void {
    this.sidebarOpen.set(true);
  }
  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  /**
   * Load a config. Pass a string for legacy local mode (defaults to
   * `/assets/gcx.json`), or a `GcxRepoSource` to read
   * `geocontext.json` from a public GitHub repo via jsdelivr. The repo
   * context is remembered so asset URLs in the config can be rewritten.
   */
  async load(source?: GcxLoadSource): Promise<GcxConfig> {
    const { configUrl, repo } = this.resolveLoadSource(source);

    const cached = this._config();
    if (this._loadedFor === configUrl && cached) return cached;

    this._loadedFor = configUrl;
    this.currentRepo.set(repo);
    this._pending = firstValueFrom(this.http.get<GcxConfig>(configUrl)).then((cfg) => {
      const rewritten = this.rewriteAssetPaths(cfg ?? {}, repo);
      this._config.set(rewritten);
      return rewritten;
    });
    return this._pending;
  }

  getConf<T = any>(key: string): T | undefined {
    const cfg = this._config();
    return cfg?.[key] as T | undefined;
  }

  snapshot(): GcxConfig | null {
    return this._config();
  }

  /**
   * Rewrites a config-supplied path/URL to something the browser can fetch.
   *
   * - Absolute http(s) URL → returned unchanged.
   * - `/<user>/<project>/assets/<path>` → jsdelivr URL for that repo's asset.
   *   Branch defaults to HEAD; consumers may include `@<branch>` after the
   *   project, e.g. `/foo/bar@main/assets/x.csv`.
   * - `/assets/<path>` while in repo mode → rewritten to the current repo's
   *   `/<user>/<project>/assets/<path>` and then to jsdelivr.
   * - Anything else → returned unchanged (caller resolves locally).
   */
  resolveAssetUrl(source: string): string {
    if (!source) return source;
    if (/^https?:\/\//i.test(source)) return source;

    const repo = this.currentRepo();

    const m = source.match(/^\/([^/]+)\/([^/@]+)(?:@([^/]+))?\/assets\/(.+)$/);
    if (m) {
      const [, user, project, branchFromPath, rest] = m;
      const branch = branchFromPath || 'HEAD';
      return `${GCX_JSDELIVR_BASE}/${user}/${project}@${branch}/${rest}`;
    }

    if (repo && source.startsWith('/assets/')) {
      const branch = repo.branch ?? 'HEAD';
      return `${GCX_JSDELIVR_BASE}/${repo.user}/${repo.project}@${branch}/${source.slice(1)}`;
    }

    return source;
  }

  private resolveLoadSource(source?: GcxLoadSource): {
    configUrl: string;
    repo: GcxRepoSource | null;
  } {
    if (!source) return { configUrl: GCX_CORE_FILE, repo: null };
    if (typeof source === 'string') return { configUrl: source, repo: null };

    const branch = source.branch ?? 'HEAD';
    const path = source.path ?? 'geocontext.json';
    const configUrl = `${GCX_JSDELIVR_BASE}/${source.user}/${source.project}@${branch}/${path}`;
    return { configUrl, repo: { ...source, branch, path } };
  }

  private rewriteAssetPaths(cfg: GcxConfig, repo: GcxRepoSource | null): GcxConfig {
    if (!cfg) return cfg;
    const out = { ...cfg };
    if (Array.isArray(cfg.datasources)) {
      out.datasources = cfg.datasources.map((ds) => this.rewriteDatasource(ds));
    }
    return out;
  }

  private rewriteDatasource(ds: any): any {
    if (!ds || typeof ds !== 'object') return ds;
    const conf = ds.conf;
    if (!conf || typeof conf !== 'object' || typeof conf.source !== 'string') return ds;
    return { ...ds, conf: { ...conf, source: this.resolveAssetUrl(conf.source) } };
  }
}
