import { GeoJsonDatasource, GeoJsonRemoteHttpDatasource } from './geojson.datasource';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MnGeoDatasourcesModule, MnGeoDatasourcesRegistryService } from '@modalnodes/mn-geo-datasources';

@NgModule({
  imports: [
    CommonModule,
    MnGeoDatasourcesModule
  ],
  declarations: [
  ],
  exports: [
  ]
})
export class DatasourcesModule {
  constructor(
    private dsreg: MnGeoDatasourcesRegistryService
  ) {
    this.dsreg.register('geojson', GeoJsonDatasource);
    this.dsreg.register('geojson+http+remote', GeoJsonRemoteHttpDatasource);
  }
}
