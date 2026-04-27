import { Routes } from '@angular/router';
import { CHCX_STATIC_ROUTES } from '@openhistorymap/chcx-static';
import { MapRouteComponent } from './map-route.component';
import { RepoMapRouteComponent } from './repo-map-route.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'map' },
  { path: 'map', component: MapRouteComponent },
  ...CHCX_STATIC_ROUTES,

  // Repo-driven views: <domain>/<user>/<project>/map renders the map from
  // `geocontext.json` (falls back to `gcx.json`) in that public GitHub repo
  // via jsdelivr. Optional ?branch=<ref>&path=<file>. ChcxStaticService
  // notices `currentRepo` and pulls chcx-static.json from the same repo, so
  // the static route reuses the same component definition.
  // `assets` is reserved at the workspace root (it's not a valid GitHub
  // username) so /assets/<…> never collides with the :user pattern.
  { path: ':user/:project/map', component: RepoMapRouteComponent },
  ...CHCX_STATIC_ROUTES.map((r) => ({
    ...r,
    path: `:user/:project/${r.path}`,
  })),
];
