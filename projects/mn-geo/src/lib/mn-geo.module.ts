import { CartoucheComponent } from './cartouche/cartouche.component';
import { MnDatasourcefilterComponent } from './mn-datasourcefilter/mn-datasourcefilter.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DatasetRegistryService } from './dataset-registry.service';
import { DatasourcesModule } from './datasources/datasources.module';
import { LayersModule } from './layers/layers.module';
import { MnDatasourceComponent } from './mn-datasource/mn-datasource.component';
import { MnLayerComponent } from './mn-layer/mn-layer.component';
import { MnMapFlavourDirective } from './mn-map-flavour.directive';
import { MnMapComponent } from './mn-map/mn-map.component';
import { MnMarkerComponent } from './mn-marker/mn-marker.component';
import { MnStyleComponent } from './mn-style/mn-style.component';
import { MnLayerswitcherComponent } from './mn-layerswitcher/mn-layerswitcher.component';
import { MnSearchComponent } from './mn-search/mn-search.component';

const dec = [
  MnMapComponent,
  MnDatasourceComponent,
  MnLayerComponent,
  MnMapFlavourDirective,
  MnStyleComponent,
  MnMarkerComponent,
  MnDatasourcefilterComponent,
  MnLayerswitcherComponent,
  MnSearchComponent,
  CartoucheComponent
];

@NgModule({
  imports: [
    CommonModule,
    LayersModule,
    DatasourcesModule
  ],
  declarations: dec,
  exports: dec,
  providers: [DatasetRegistryService]
})
export class MnGeoModule { }
