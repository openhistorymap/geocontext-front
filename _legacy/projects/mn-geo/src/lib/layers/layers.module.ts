import { FeatureLayer } from './feature.directive';
import { HeatmapLayer } from './heatmap.directive';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { MnGeoLayersRegistryService, MnGeoLayersModule } from '@modalnodes/mn-geo-layers';


@NgModule({
  imports: [
    CommonModule,
    MnGeoLayersModule
  ],
  declarations: [ ],
  exports: [ ],
  providers: [ ],
  entryComponents: [ ],
})
export class LayersModule {
  constructor(
    private layers: MnGeoLayersRegistryService
  ) {
    // layers.register('heatmap', HeatmapLayer);
    layers.register('feature', FeatureLayer);
    layers.register('features', FeatureLayer);
  }
}
