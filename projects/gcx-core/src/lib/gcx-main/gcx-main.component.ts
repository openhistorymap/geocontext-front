import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { GcxCoreService } from '../gcx-core.service';
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
      <nav class="masthead-nav" aria-label="Sections">
        <a [routerLink]="mapLink()" routerLinkActive="is-active" class="masthead-link">Map</a>
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

      /* --- Routed body ------------------------------------------------ */
      .gcx-main-outlet {
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        position: relative;
        background: var(--gcx-paper);
      }
      .gcx-main-outlet > :not(router-outlet) {
        position: absolute;
        inset: 0;
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

  readonly title = input<string>('GeoContext');
  readonly items = input<GcxRouteItem[]>([]);
  /** Engine version, baked in from `version.ts` at publish time. */
  readonly version = GCX_VERSION;

  /** Repo-aware path prefix. `/<user>/<project>` in repo mode, empty
   *  array in local mode (so subsequent segments form `/map`, `/static/X`). */
  private readonly prefix = computed<string[]>(() => {
    const repo = this.gcx.currentRepo();
    return repo ? [repo.user, repo.project] : [];
  });

  readonly mapLink = computed<any[]>(() => ['/', ...this.prefix(), 'map']);

  staticLink(target: string): any[] {
    return ['/', ...this.prefix(), 'static', target];
  }
}
