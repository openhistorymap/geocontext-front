import { Routes } from '@angular/router';
import { MapRouteComponent } from './map-route.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'map' },
  { path: 'map', component: MapRouteComponent },
];
