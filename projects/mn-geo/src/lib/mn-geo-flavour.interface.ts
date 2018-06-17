import { MnMapComponent } from '@modalnodes/mn-geo';
import { LayerDirective } from './layers/layer.directive';
import { DatasourceDirective } from './datasources/datasource.directive';
export interface MnGeoFlavour {
  setup(map: MnMapComponent);

  addLayer(layer: LayerDirective);
  removeLayer(id);

  addDatasource(datasource: DatasourceDirective);
  removeDatasource(id);
}
