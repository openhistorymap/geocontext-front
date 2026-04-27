import { Routes } from '@angular/router';
import { MapRouteComponent } from './map-route.component';
import { RepoMapRouteComponent } from './repo-map-route.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'map' },
  { path: 'map', component: MapRouteComponent },

  // Repo-driven views: <domain>/<user>/<project>/map renders the map from
  // `geocontext.json` in that public GitHub repo (via jsdelivr).
  // Optional query params: ?branch=<ref>&path=<file>
  // `assets` is reserved at the top level — GitHub usernames can't take that
  // value — so /assets/<…> never collides with the :user pattern.
  { path: ':user/:project/map', component: RepoMapRouteComponent },

  // /:user/:project/static/:target — pending chcx-static port.
  // /:user/:project/assets/<path> — handled by GcxCoreService.resolveAssetUrl
  // when references appear inside a loaded geocontext.json; no route needed.
];
