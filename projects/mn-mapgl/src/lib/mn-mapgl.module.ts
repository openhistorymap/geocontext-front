import { MnGeoModule } from '@modalnodes/mn-geo';
import { NgModule } from '@angular/core';
import { MnMap3dDirective } from './mn-map-3d.directive';
import { MapboxStyleDirective } from './mapbox.style.directive';


@NgModule({
  imports: [
    MnGeoModule
  ],
  declarations: [MnMap3dDirective, MapboxStyleDirective],
  exports: [MnMap3dDirective, MapboxStyleDirective]
})
export class MnMapglModule { }
