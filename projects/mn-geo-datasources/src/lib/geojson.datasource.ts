import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { Datasource, RemoteHttpDatasource } from './datasource';
import { MnGeoDatasourcesRegistryService } from './mn-geo-datasources-registry.service';

/**
 * Pass-through GeoJSON datasource: the data already arrived as parsed
 * GeoJSON, no transformation needed.
 */
export class GeoJsonDatasource extends Datasource {
  override prepareData(data: any): any {
    return data;
  }
}

export class GeoJsonRemoteHttpDatasource extends RemoteHttpDatasource {
  override prepareData(data: any): any {
    return data;
  }
}

/**
 * Registers `geojson` (inline) and `geojson+http+remote` (fetched) datasource
 * types. Drop into `app.config`'s providers.
 */
export function provideMnGeoDatasourcesGeojson(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const reg = inject(MnGeoDatasourcesRegistryService);
    reg.register('geojson', GeoJsonDatasource);
    reg.register('geojson+http+remote', GeoJsonRemoteHttpDatasource);
  });
}
