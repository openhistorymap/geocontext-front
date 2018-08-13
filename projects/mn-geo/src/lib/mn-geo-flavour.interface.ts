import { MnMapComponent } from './mn-map/mn-map.component';
import { LayerComponent } from './layers/layer.directive';
import { DatasourceDirective } from './datasources/datasource.directive';
export interface MnGeoFlavour {
  setup(map: MnMapComponent);

  addLayer(layer: LayerComponent);
  removeLayer(id);

  addDatasource(datasource: DatasourceDirective);
  removeDatasource(id);
}
