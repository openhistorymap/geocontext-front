import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { MnGeoDatasourcesRegistryService } from '@openhistorymap/mn-geo-datasources';
import { CsvDatasource, CsvRemoteHttpDatasource } from './csv';

export function provideMnGeoDatasourcesCsv(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const reg = inject(MnGeoDatasourcesRegistryService);
    reg.register('csv', CsvDatasource);
    reg.register('csv+http+remote', CsvRemoteHttpDatasource);
  });
}
