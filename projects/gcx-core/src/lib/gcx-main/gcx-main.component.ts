import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GcxCoreService } from '../gcx-core.service';
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
  imports: [RouterLink, RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="gcx.toggleSidebar()" aria-label="Toggle sidebar">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="title">{{ title() }}</span>
      <span class="spacer"></span>
      <button mat-button [routerLink]="mapLink()">
        <mat-icon>map</mat-icon>
        <span>Map</span>
      </button>
      @for (item of items(); track item.target) {
        <button mat-button [routerLink]="staticLink(item.target)">
          @if (item.icon) { <mat-icon>{{ item.icon }}</mat-icon> }
          <span>{{ item.title }}</span>
        </button>
      }
    </mat-toolbar>

    <main class="gcx-main-outlet">
      <router-outlet />
    </main>

    <footer class="gcx-footer">
      Made with ♥ in Bologna — Engine: GeoContext {{ version }}
    </footer>
  `,
  styles: [
    `
      :host { display: flex; flex-direction: column; height: 100vh; }
      .title { margin-left: 8px; font-weight: 500; }
      .spacer { flex: 1 1 auto; }
      /* The outlet must itself be a flex column so the routed component
         participates in the flex chain — otherwise mat-drawer-container
         falls back to content-sized height and the map shrinks to the
         sidebar's intrinsic height on first paint. */
      .gcx-main-outlet {
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .gcx-footer {
        background: var(--mat-sys-surface, #fff);
        color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));
        border-top: 1px solid var(--mat-sys-outline-variant, rgba(0, 0, 0, 0.12));
        text-align: center;
        /* Inherit the rest of the interface's typography (Roboto via the
         *  Material theme) instead of forcing a different font stack. */
        font: var(--mat-sys-label-medium, 500 0.75rem/1rem Roboto, sans-serif);
        padding: 6px 0;
      }
    `,
  ],
})
export class GcxMainComponent {
  readonly gcx = inject(GcxCoreService);

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
