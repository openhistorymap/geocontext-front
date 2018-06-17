import { DatasourceDirective } from './datasource.directive';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsvDirective } from './csv.directive';
import { JsonDirective } from './json.directive';
import { RemoteDirective } from './remote.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CsvDirective,
    JsonDirective,
    RemoteDirective,
    DatasourceDirective,
  ],
  exports: [
    CsvDirective,
    JsonDirective,
    RemoteDirective,
    DatasourceDirective
  ]
})
export class DatasourcesModule { }
