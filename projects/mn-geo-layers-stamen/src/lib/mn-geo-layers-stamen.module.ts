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
    this.layers.register('stamen-toner', StamenTonerLayer);
    this.layers.register('stamen-toner-lite', StamenTonerLiteLayer);
    this.layers.register('stamen-watercolor', StamenWatercolorLayer);
    this.layers.register('stamen-terrain', StamenTerrainLayer);
  }
}
