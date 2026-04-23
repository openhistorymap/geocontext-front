import { Routes } from '@angular/router';
import { GcxMapComponent } from './gcx-map/gcx-map.component';

/**
 * Default app routes. Consumers can spread these alongside their own
 * (e.g. `chcx-static` routes) before passing to `provideRouter()`.
 */
export const GCX_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'map' },
  { path: 'map', component: GcxMapComponent },
];
