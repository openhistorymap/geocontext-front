import { Routes } from '@angular/router';
import { ChcxStaticpageComponent } from './chcx-staticpage.component';

/**
 * Default static-page routes. Consumers spread these alongside
 * `GCX_ROUTES` (and the repo-driven routes) before passing to
 * `provideRouter()`.
 */
export const CHCX_STATIC_ROUTES: Routes = [
  { path: 'static/:name', component: ChcxStaticpageComponent },
];
