import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import {
  GcxCoreService,
  GcxMapComponent,
  GCX_JSDELIVR_BASE,
  GCX_REPO_CANDIDATE_PATHS,
} from '@openhistorymap/gcx-core';
import { MnGeoFlavoursMaplibreDirective } from '@openhistorymap/mn-geo-flavours-mapbox';

/**
 * Route at `/:user/:project/map`. Loads `geocontext.json` (or the `path=`
 * query) from the GitHub repo at `:user/:project` via jsdelivr and renders
 * the standard `<gcx-map>`. Query params:
 *   - `branch=<ref>` — git ref (default `HEAD`)
 *   - `path=<file>`  — config file path within repo (default `geocontext.json`)
 */
@Component({
  selector: 'app-repo-map-route',
  standalone: true,
  imports: [GcxMapComponent, MnGeoFlavoursMaplibreDirective],
  template: `
    @if (status() === 'ready') {
      <gcx-map>
        <div mnMapFlavourMaplibre></div>
      </gcx-map>
    } @else if (status() === 'error') {
      <div class="repo-msg repo-error">
        <strong>Could not load {{ user() }}/{{ project() }}</strong>
        <p>{{ message() }}</p>
        <small>Tried:</small>
        <pre>{{ tried() }}</pre>
      </div>
    } @else {
      <div class="repo-msg">Loading {{ user() }}/{{ project() }}…</div>
    }
  `,
  styles: [
    `
      :host { display: block; position: absolute; inset: 0; }
      .repo-msg {
        padding: 24px;
        font-family: sans-serif;
        max-width: 640px;
        margin: 0 auto;
      }
      .repo-error { color: #b00020; }
      .repo-msg pre {
        background: #f5f5f5;
        padding: 8px;
        border-radius: 4px;
        white-space: pre-wrap;
        word-break: break-all;
        font-size: 0.85em;
      }
    `,
  ],
})
export class RepoMapRouteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly gcx = inject(GcxCoreService);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = signal('');
  readonly project = signal('');
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  readonly message = signal<string>('');
  readonly tried = signal<string>('');

  constructor() {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, query]) => {
        const user = params.get('user') ?? '';
        const project = params.get('project') ?? '';
        const branch = query.get('branch') ?? undefined;
        const path = query.get('path') ?? undefined;

        this.user.set(user);
        this.project.set(project);
        this.status.set('loading');

        this.gcx
          .load({ user, project, branch, path })
          .then(() => this.status.set('ready'))
          .catch((err: any) => {
            this.message.set(err?.message ?? String(err));
            const ref = branch ?? 'HEAD';
            const base = `${GCX_JSDELIVR_BASE}/${user}/${project}@${ref}`;
            const paths = path ? [path] : [...GCX_REPO_CANDIDATE_PATHS];
            this.tried.set(paths.map((p) => `${base}/${p}`).join('\n'));
            this.status.set('error');
          });
      });
  }
}
