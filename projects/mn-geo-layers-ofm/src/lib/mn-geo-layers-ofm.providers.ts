import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { MnGeoLayersRegistryService } from '@openhistorymap/mn-geo-layers';
import { OfmTiles } from './ofm';

export function provideMnGeoLayersOfm(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const registry = inject(MnGeoLayersRegistryService);
    registry.register('ofm-tiled', OfmTiles);
  });
}
