import { Layer } from '@modalnodes/mn-geo-layers';
import * as L from 'leaflet';
import { Injectable } from '@angular/core';

@Injectable()
export class FeatureLayer extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(true);
  }

  triggerClicked(lyr, feat): Function {
    return (x) => {
      this.featureClicked(feat);
    };
  }

  create(): any {
    const ds = this.getConfiguration().datasource;
    const options = {
      onEachFeature: (feature, layer) => {
        layer.on({
          click: this.triggerClicked(layer, feature),
        });
      }
    };
    if (this.getConfiguration().styles.length > 0) {
      const geojsonMarkerOptions = this.getConfiguration().styles[0].options;
      options['pointToLayer'] = function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
      };
    }
    const geoJsonFeature: any = this.getDatasourceRepo().for(ds);
    console.log('geojson', ds, geoJsonFeature, this.getDatasourceRepo());
    const r = L.geoJSON(geoJsonFeature, options);
    return r;
  }
}
