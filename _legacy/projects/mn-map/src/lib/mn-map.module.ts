import { MnGeoModule } from '@modalnodes/mn-geo';
import { NgModule } from '@angular/core';
import { MnMap2dDirective } from './mn-map-2d.directive';

@NgModule({
  imports: [
    MnGeoModule
  ],
  declarations: [MnMap2dDirective],
  exports: [MnMap2dDirective]
})
export class MnMapModule { }
