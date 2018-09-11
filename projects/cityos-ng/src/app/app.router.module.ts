import { CityosCoverComponent } from './cityos-cover/cityos-cover.component';
import { CityosComponent } from './cityos/cityos.component';
import { RouterModule, Route } from '@angular/router';
import { NgModule } from '@angular/core';

export const ROUTES: Route[] = [
  { path: ':mapname/:location/:media', component: CityosComponent },
  { path: ':mapname/:location', component: CityosComponent },
  { path: ':mapname', component: CityosComponent },
  { path: '', component: CityosCoverComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(ROUTES, {useHash: true})]
})
export class AppRouterModule { }
