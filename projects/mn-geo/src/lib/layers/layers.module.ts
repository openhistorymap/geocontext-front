import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayerDirective } from './layer.directive';

import { DataDirective } from './data.directive';
import { TileDirective } from './tile.directive';

import { FeatureDirective } from './feature.directive';
import { HeatmapDirective } from './heatmap.directive';

import { CartoDirective } from './carto.directive';
import { OsmDirective, OsmVectorDirective } from './osm.directive';
import { StamenDirective } from './stamen.directive';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    OsmDirective,
    OsmVectorDirective,
    TileDirective,
    DataDirective,
    StamenDirective,
    CartoDirective,
    LayerDirective,
    FeatureDirective,
    HeatmapDirective
  ],
  exports: [
    OsmDirective,
    OsmVectorDirective,
    TileDirective,
    DataDirective,
    StamenDirective,
    CartoDirective,
    LayerDirective,
    FeatureDirective,
    HeatmapDirective
  ]
})
export class LayersModule { }
