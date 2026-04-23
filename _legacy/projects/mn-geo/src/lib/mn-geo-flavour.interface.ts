import { MnMapComponent } from './mn-map/mn-map.component';
export interface MnGeoFlavour {
  setup(map: MnMapComponent);

  addLayer(layer: any);
  removeLayer(id);

  addDatasource(datasource: any);
  removeDatasource(id);
}
