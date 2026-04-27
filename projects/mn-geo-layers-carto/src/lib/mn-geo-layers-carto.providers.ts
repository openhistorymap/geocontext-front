import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { MnGeoLayersRegistryService } from '@openhistorymap/mn-geo-layers';
import {
  CartoDark,
  CartoDarkNoLabels,
  CartoLight,
  CartoLightNoLabels,
  CartoPositron,
  CartoVoyager,
  CartoVoyagerNoLabels,
} from './carto';

export function provideMnGeoLayersCarto(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const reg = inject(MnGeoLayersRegistryService);
    reg.register('carto-voyager', CartoVoyager);
    reg.register('carto-voyager-nolabels', CartoVoyagerNoLabels);
    reg.register('carto-light', CartoLight);
    reg.register('carto-light-nolabels', CartoLightNoLabels);
    reg.register('carto-dark', CartoDark);
    reg.register('carto-dark-nolabels', CartoDarkNoLabels);
    reg.register('carto-positron', CartoPositron);
  });
}
