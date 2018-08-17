import { Layer } from '@modalnodes/mn-geo-layers';
import * as L from 'leaflet';
import { Injectable } from '@angular/core';

@Injectable()
export class FeatureLayer extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(true);
  }

  create(): any {
    const ds = this.getConfiguration().datasource;
    const geoJsonFeature: any = this.getDatasourceRepo().for(ds);
    const r = L.geoJSON(geoJsonFeature);
    return r;
  }
}
