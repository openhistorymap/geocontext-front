import { MnGeoModule } from '@modalnodes/mn-geo';
import { NgModule } from '@angular/core';
import { MnMap3dDirective } from './mn-map-3d.directive';


@NgModule({
  imports: [
    MnGeoModule
  ],
  declarations: [MnMap3dDirective],
  exports: [MnMap3dDirective]
})
export class MnMapglModule { }
