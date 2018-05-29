import { NgModule } from '@angular/core';
import { MnMapComponent } from './mn-map/mn-map.component';
import { CsvDirective } from './datasources/csv.directive';
import { JsonDirective } from './datasources/json.directive';
import { RemoteDirective } from './datasources/remote.directive';
import { DataDirective } from './layer/data.directive';
import { TileDirective } from './layer/tile.directive';
import { MnDatasourceComponent } from './mn-datasource/mn-datasource.component';
import { MnLayerComponent } from './mn-layer/mn-layer.component';

const dec = [
  MnMapComponent,
  CsvDirective,
  JsonDirective,
  RemoteDirective,
  DataDirective,
  TileDirective,
  MnDatasourceComponent,
  MnLayerComponent];

@NgModule({
  imports: [
  ],
  declarations: dec,
  exports: dec
})
export class MnGeoModule { }
