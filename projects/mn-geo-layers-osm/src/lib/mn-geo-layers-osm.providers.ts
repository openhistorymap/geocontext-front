import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { MnGeoLayersRegistryService } from '@openhistorymap/mn-geo-layers';
import { OsmOverpass, OsmTiles, OsmVectors } from './osm';

/**
 * Registers the OSM layer types with `MnGeoLayersRegistryService` at bootstrap.
 * Standalone-apps replacement for the legacy `MnGeoLayersOsmModule` constructor
 * side-effect — drop this into the app's providers array.
 */
export function provideMnGeoLayersOsm(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const registry = inject(MnGeoLayersRegistryService);
    registry.register('osm-tiled', OsmTiles);
    registry.register('osm-vector', OsmVectors);
    registry.register('osm-overpass', OsmOverpass);
  });
}
