import { StamenTonerLayer, StamenTonerLiteLayer, StamenWatercolorLayer, StamenTerrainLayer } from './stamen';
import { MnGeoLayersRegistryService } from '@modalnodes/mn-geo-layers';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
  ],
  declarations: [],
  exports: []
})
export class MnGeoLayersStamenModule {
  constructor(
    private layers: MnGeoLayersRegistryService
  ) {
    this.layers.register('toner', StamenTonerLayer);
    this.layers.register('toner-lite', StamenTonerLiteLayer);
    this.layers.register('watercolor', StamenWatercolorLayer);
    this.layers.register('terrain', StamenTerrainLayer);
  }
}
