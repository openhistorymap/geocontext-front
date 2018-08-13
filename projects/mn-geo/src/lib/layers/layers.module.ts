import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TileComponent } from './tile.directive';
import { DataComponent } from './data.directive';

import { FeatureComponent } from './feature.directive';
import { HeatmapComponent } from './heatmap.directive';


import { MnGeoLayersRegistryService, MnGeoLayersModule } from '@modalnodes/mn-geo-layers';


@NgModule({
  imports: [
    CommonModule,
    MnGeoLayersModule
  ],
  declarations: [
    TileComponent,
    DataComponent,
    FeatureComponent,
    HeatmapComponent
  ],
  exports: [ ],
  providers: [ ],
  entryComponents: [ ],
})
export class LayersModule {
  constructor(
    private layers: MnGeoLayersRegistryService
  ) {
    layers.register('heatmap', HeatmapComponent);
    layers.register('feature', FeatureComponent);
  }
}
