import { CsvDatasource, CsvRemoteHttpDatasource } from './csvparser';
import { MnGeoDatasourcesRegistryService } from '@modalnodes/mn-geo-datasources';
import { NgModule } from '@angular/core';
import { PapaParseModule } from 'ngx-papaparse';

@NgModule({
  imports: [
    PapaParseModule
  ],
  declarations: [],
  exports: []
})
export class MnGeoDatasourcesCsvModule {
  constructor(
    private ds: MnGeoDatasourcesRegistryService
  ) {
    this.ds.register('csv', CsvDatasource);
    this.ds.register('csv+http+remote', CsvRemoteHttpDatasource);
  }
 }
