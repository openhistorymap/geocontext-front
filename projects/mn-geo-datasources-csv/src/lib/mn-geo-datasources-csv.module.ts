import { CsvDatasource, CsvRemoteHttpDatasource } from './csvparser';
import { MnGeoDatasourcesRegistryService } from '@modalnodes/mn-geo-datasources';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
  ],
  declarations: [],
  exports: []
})
export class MnGeoDatasourcesCsvModule {
  constructor(
    private ds: MnGeoDatasourcesRegistryService
  ) {
    this.ds.register('csv', CsvDatasource);
    this.ds.register('csv+remote+http', CsvRemoteHttpDatasource);
  }
 }
