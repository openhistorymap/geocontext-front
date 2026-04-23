import { NgModule } from '@angular/core';
import { MnGeoLayersModule, MnGeoLayersRegistryService } from '@modalnodes/mn-geo-layers';
import { OsmTiles, OsmVectors } from './osm';

@NgModule({
  imports: [
    MnGeoLayersModule
  ],
  declarations: [],
  exports: []
})
export class MnGeoLayersOsmModule {
  constructor(
    private layers: MnGeoLayersRegistryService
  ) {
    this.layers.register('osm-tiled', OsmTiles);
    this.layers.register('osm-vector', OsmVectors);
  }
}
