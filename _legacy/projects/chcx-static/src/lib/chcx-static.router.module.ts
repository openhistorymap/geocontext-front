import { ChcxStaticpageComponent } from './chcx-staticpage/chcx-staticpage.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

export const ROUTES = [{
    path: 'static/:name',
    component: ChcxStaticpageComponent
}];

@NgModule({
    imports: [RouterModule.forRoot(ROUTES, { useHash: true })]
})
export class ChcxRouterModule { }
