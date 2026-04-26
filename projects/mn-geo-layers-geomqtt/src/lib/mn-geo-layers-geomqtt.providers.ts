import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { MnGeoLayersRegistryService } from '@openhistorymap/mn-geo-layers';
import { GeoMqttLayer } from './geomqtt';

export function provideMnGeoLayersGeomqtt(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const registry = inject(MnGeoLayersRegistryService);
    registry.register('geomqtt', GeoMqttLayer);
  });
}
