import { CartoDirective } from './carto.directive';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataDirective } from './data.directive';
import { TileDirective } from './tile.directive';

import { OsmDirective } from './osm.directive';
import { StamenDirective } from './stamen.directive';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [OsmDirective, TileDirective, DataDirective, StamenDirective, CartoDirective],
  exports: [OsmDirective, TileDirective, DataDirective, StamenDirective, CartoDirective]
})
export class LayersModule { }
