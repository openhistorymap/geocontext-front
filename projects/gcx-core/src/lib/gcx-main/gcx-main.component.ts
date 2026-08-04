import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  GcxCoreService,
  GCX_JSDELIVR_BASE,
  GCX_STORIES_CANDIDATE,
  GCX_STORY_CANDIDATE,
  GCX_STORYBOOK_BASE,
  type GcxStoryEntry,
} from '../gcx-core.service';
import { GcxThemeService } from '../gcx-theme.service';
import { GCX_VERSION } from '../version';

export interface GcxRouteItem {
  title: string;
  target: string;
  icon?: string;
}

/**
 * Top-level shell: Material toolbar with menu/map buttons + dynamic static
 * page links, followed by a `<router-outlet>` and a footer strip.
 *
 * Toolbar routerLinks are scoped to the active context: in local mode they
 * resolve to `/map` and `/static/<target>`; once `GcxCoreService.currentRepo()`
 * is set (repo-driven view at `/:user/:project/...`), they resolve to
 * `/:user/:project/map` and `/:user/:project/static/<target>` so navigating
 * the toolbar keeps you inside the same repo's content surface.
 */
@Component({
  selector: 'gcx-main',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatIconModule],
  template: `
    <header class="masthead">
      <button class="masthead-menu" type="button" (click)="gcx.toggleSidebar()" aria-label="Toggle sidebar">
        <mat-icon>menu</mat-icon>
      </button>
      <h1 class="masthead-title">
        <a [routerLink]="mapLink()" class="masthead-title-link">{{ title() }}</a>
      </h1>
      <span class="masthead-spacer"></span>
      <button
        class="masthead-toggle"
        type="button"
        (click)="theme.toggle()"
        [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
        [attr.title]="theme.isDark() ? 'Light mode' : 'Dark mode'"
      >
        <mat-icon>{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>
      @if (hasDatapackage() && datapackageUrl(); as dpUrl) {
        <a
          class="masthead-ext"
          [href]="dpUrl"
          target="_blank"
          rel="noopener"
          title="Data Package (datapackage.json)"
          aria-label="Frictionless Data Package on GitHub"
        >
          <mat-icon>data_object</mat-icon>
        </a>
      }
      @if (repoUrl(); as url) {
        <a
          class="masthead-ext"
          [href]="url"
          target="_blank"
          rel="noopener"
          title="Repository su GitHub"
          aria-label="Source repository on GitHub"
        >
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </a>
      }
      <nav class="masthead-nav" aria-label="Sections">
        <a [routerLink]="mapLink()" routerLinkActive="is-active" class="masthead-link">Map</a>
        @if (storybookUrl(); as storyHref) {
          @if (stories(); as narrations) {
            <a
              class="masthead-link masthead-link--ext"
              [href]="storyHref"
              target="_blank"
              rel="noopener"
              [title]="storiesHint()"
            >{{ narrations.length > 1 ? 'Stories' : 'Story' }}</a>
          }
        }
        @for (item of items(); track item.target) {
          <a [routerLink]="staticLink(item.target)" routerLinkActive="is-active" class="masthead-link">
            {{ item.title }}
          </a>
        }
      </nav>
    </header>

    <main class="gcx-main-outlet">
      <router-outlet />
    </main>

    <footer class="colophon">
      <span class="colophon-mark">§</span>
      Made in Bologna by
      <a href="https://www.openhistorymap.org" target="_blank" rel="noopener">OpenHistoryMap</a>
      <span aria-hidden="true">·</span>
      Engine
      <a href="https://github.com/openhistorymap/geocontext-front" target="_blank" rel="noopener">
        GeoContext
        <span class="colophon-version">{{ version }}</span>
      </a>
    </footer>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--gcx-paper);
        color: var(--gcx-ink);
      }

      /* --- Masthead --------------------------------------------------- */
      .masthead {
        display: flex;
        align-items: baseline;
        gap: 14px;
        padding: 14px 24px 12px;
        border-bottom: 1px solid var(--gcx-rule);
        background: var(--gcx-paper);
        position: relative;
      }
      /* Tiny ink-mark above the title — a printer's cue, not a logo. */
      .masthead::before {
        content: '';
        position: absolute;
        left: 24px;
        top: 0;
        width: 28px;
        height: 3px;
        background: var(--gcx-accent);
      }
      .masthead-menu,
      .masthead-toggle {
        align-self: center;
        background: transparent;
        border: 0;
        padding: 4px 6px;
        color: var(--gcx-ink-soft);
        cursor: pointer;
        line-height: 0;
        border-radius: 2px;
        transition: color 120ms ease;
      }
      .masthead-menu { margin-right: 4px; }
      .masthead-toggle {
        margin-right: 18px;
        position: relative;
      }
      /* Faint hairline before the nav links to separate "control" from
         "navigation". */
      .masthead-toggle::after {
        content: '';
        position: absolute;
        right: -10px;
        top: 25%;
        bottom: 25%;
        width: 1px;
        background: var(--gcx-rule);
      }
      .masthead-menu:hover,
      .masthead-toggle:hover { color: var(--gcx-accent-deep); }
      .masthead-menu .mat-icon,
      .masthead-toggle .mat-icon {
        font-size: 19px;
        width: 19px;
        height: 19px;
      }

      /* External links (repo, datapackage): same restrained icon-button
         treatment as the theme toggle, but they're anchors. */
      .masthead-ext {
        align-self: center;
        display: inline-flex;
        align-items: center;
        padding: 4px 6px;
        margin-right: 6px;
        color: var(--gcx-ink-soft);
        cursor: pointer;
        line-height: 0;
        border-radius: 2px;
        text-decoration: none;
        transition: color 120ms ease;
      }
      .masthead-ext:hover { color: var(--gcx-accent-deep); }
      .masthead-ext .mat-icon {
        font-size: 19px;
        width: 19px;
        height: 19px;
      }
      .masthead-ext svg { display: block; }
      .masthead-title {
        margin: 0;
        font-family: var(--gcx-display);
        font-weight: 500;
        font-size: var(--gcx-text-xl);
        line-height: 1.1;
        letter-spacing: -0.005em;
      }
      .masthead-title-link {
        color: var(--gcx-ink);
        text-decoration: none;
      }
      .masthead-title-link:hover { color: var(--gcx-accent-deep); }
      .masthead-spacer { flex: 1 1 auto; }
      .masthead-nav {
        display: flex;
        align-items: baseline;
        gap: 22px;
        align-self: center;
      }
      .masthead-link {
        font-family: var(--gcx-body);
        font-size: var(--gcx-text-sm);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--gcx-ink-soft);
        text-decoration: none;
        padding-bottom: 2px;
        border-bottom: 1px solid transparent;
        transition: color 120ms ease, border-color 120ms ease;
      }
      .masthead-link:hover {
        color: var(--gcx-ink);
        border-bottom-color: var(--gcx-rule-strong);
      }
      .masthead-link.is-active {
        color: var(--gcx-accent-deep);
        border-bottom-color: var(--gcx-accent);
      }
      /* Leaving the app for the story runner is signposted, the same way
         the runner signposts its link back to the map. */
      .masthead-link--ext::after {
        content: ' ↗';
        font-size: 0.85em;
        opacity: 0.7;
      }

      /* --- Routed body ------------------------------------------------
         position: relative is the anchor; the routed component fills it
         absolutely via its own :host styles (a rule from here can't pierce
         Angular's view encapsulation to reach the dynamically inserted
         route component element). */
      .gcx-main-outlet {
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        position: relative;
        background: var(--gcx-paper);
      }

      /* --- Colophon (footer) ------------------------------------------ */
      .colophon {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 8px;
        padding: 8px 24px;
        border-top: 1px solid var(--gcx-rule);
        background: var(--gcx-paper);
        font-family: var(--gcx-body);
        font-size: 11.5px;
        line-height: 1.4;
        color: var(--gcx-ink-faint);
      }
      .colophon a {
        color: var(--gcx-ink-soft);
        text-decoration-color: color-mix(in oklch, var(--gcx-rule-strong) 70%, transparent);
        text-decoration-thickness: 0.5px;
        text-underline-offset: 2px;
      }
      .colophon a:hover {
        color: var(--gcx-accent-deep);
        text-decoration-color: var(--gcx-accent);
      }
      .colophon-mark {
        font-family: var(--gcx-display);
        font-style: italic;
        color: var(--gcx-accent);
        font-size: 13px;
        margin-right: 2px;
      }
      .colophon-version {
        font-variant-numeric: tabular-nums;
        margin-left: 4px;
        opacity: 0.65;
      }
    `,
  ],
})
export class GcxMainComponent {
  readonly gcx = inject(GcxCoreService);
  readonly theme = inject(GcxThemeService);
  private readonly http = inject(HttpClient);

  readonly title = input<string>('GeoContext');
  readonly items = input<GcxRouteItem[]>([]);
  /** Engine version, baked in from `version.ts` at publish time. */
  readonly version = GCX_VERSION;

  /** GitHub URL of the repo backing the current view, or null in local
   *  (non-repo) mode. Shown as an octocat link in the masthead. */
  readonly repoUrl = computed<string | null>(() => {
    const repo = this.gcx.currentRepo();
    return repo ? `https://github.com/${repo.user}/${repo.project}` : null;
  });

  /** GitHub blob URL of the repo's datapackage.json (the icon links
   *  straight to the descriptor on GitHub). `/blob/HEAD/` resolves to
   *  the default branch on github.com. Only meaningful when
   *  `hasDatapackage()` is true. */
  readonly datapackageUrl = computed<string | null>(() => {
    const repo = this.gcx.currentRepo();
    if (!repo) return null;
    const ref = repo.branch ?? 'HEAD';
    return `https://github.com/${repo.user}/${repo.project}/blob/${ref}/datapackage.json`;
  });

  /** Whether the current repo ships a datapackage.json. Probed (HEAD)
   *  against jsdelivr whenever the repo context changes; the masthead
   *  icon is hidden until/unless the probe succeeds. */
  readonly hasDatapackage = signal(false);

  /** Narrations this repo publishes, or null when it publishes none.
   *  Probed alongside the datapackage whenever the repo changes. */
  readonly stories = signal<GcxStoryEntry[] | null>(null);

  /** GeoContext Storybook URL for the current repo — the same
   *  `/<user>/<project>/` shape this app uses for `/map`. */
  readonly storybookUrl = computed<string | null>(() => {
    const repo = this.gcx.currentRepo();
    if (!repo) return null;
    const path = `${GCX_STORYBOOK_BASE}/${repo.user}/${repo.project}/`;
    const ref = repo.branch && repo.branch !== 'HEAD' ? `?branch=${encodeURIComponent(repo.branch)}` : '';
    return `${path}${ref}`;
  });

  /** Tooltip listing what's there, so the reader knows before leaving. */
  readonly storiesHint = computed<string>(() => {
    const list = this.stories() ?? [];
    if (list.length > 1) {
      const titles = list.map((s) => s.title ?? s.id).filter(Boolean);
      return `Read as a story — ${titles.join(', ')}`;
    }
    return 'Read this map as a scrolling story';
  });

  /** Repo-aware path prefix. `/<user>/<project>` in repo mode, empty
   *  array in local mode (so subsequent segments form `/map`, `/static/X`). */
  private readonly prefix = computed<string[]>(() => {
    const repo = this.gcx.currentRepo();
    return repo ? [repo.user, repo.project] : [];
  });

  readonly mapLink = computed<any[]>(() => ['/', ...this.prefix(), 'map']);

  constructor() {
    effect(() => {
      const repo = this.gcx.currentRepo();
      this.hasDatapackage.set(false);
      if (!repo) return;
      const ref = repo.branch ?? 'HEAD';
      const url = `${GCX_JSDELIVR_BASE}/${repo.user}/${repo.project}@${ref}/datapackage.json`;
      this.http.head(url, { observe: 'response' }).subscribe({
        next: () => this.hasDatapackage.set(true),
        error: () => this.hasDatapackage.set(false),
      });
    });

    // Stories: a `stories.json` collection first, then a lone
    // `story.json`. Both are optional, and a repo with neither simply
    // shows no link — the probe failing is the expected case, not an
    // error worth surfacing.
    effect(() => {
      const repo = this.gcx.currentRepo();
      this.stories.set(null);
      if (!repo) return;
      const ref = repo.branch ?? 'HEAD';
      const base = `${GCX_JSDELIVR_BASE}/${repo.user}/${repo.project}@${ref}`;

      this.http.get<{ stories?: GcxStoryEntry[] }>(`${base}/${GCX_STORIES_CANDIDATE}`).subscribe({
        next: (collection) => {
          const entries = (collection?.stories ?? []).filter((s) => s?.path && !s.draft);
          this.stories.set(entries.length ? entries : null);
        },
        error: () => {
          this.http.head(`${base}/${GCX_STORY_CANDIDATE}`, { observe: 'response' }).subscribe({
            next: () => this.stories.set([{ title: 'Story' }]),
            error: () => this.stories.set(null),
          });
        },
      });
    });
  }

  staticLink(target: string): any[] {
    return ['/', ...this.prefix(), 'static', target];
  }
}
