import { C3DLayer } from './c3d.layer';
import { MnGeoLayersModule, MnGeoLayersRegistryService } from '@modalnodes/mn-geo-layers';
import { NgModule } from '@angular/core';
import { MnGeoLayersC3dService } from './mn-geo-layers-c3d.service';

@NgModule({
  imports: [
    MnGeoLayersModule
  ],
  declarations: [],
  exports: [],
  providers: [MnGeoLayersC3dService]
})
export class MnGeoLayersC3dModule {
  constructor(
    private layers: MnGeoLayersRegistryService
  ) {
    this.layers.register('c3d', C3DLayer);
  }
}
