import { GcxMapComponent } from './gcx-map/gcx-map.component';
import { RouterModule } from '@angular/router';
import { GcxMainComponent } from './gcx-main/gcx-main.component';
import { NgModule } from '@angular/core';

export const ROUTES = [{
    path: '',
    component: GcxMainComponent
}, {
        path: 'map',
        component: GcxMapComponent
}];

@NgModule({
    imports: [RouterModule.forRoot(ROUTES, {useHash: true})]
})
export class GcxRouterModule { }
