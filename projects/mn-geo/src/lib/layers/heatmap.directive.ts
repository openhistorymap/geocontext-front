import { Layer } from '@modalnodes/mn-geo-layers';
import * as L from 'leaflet';
import { Injectable } from '@angular/core';

@Injectable()
export class HeatmapLayer extends Layer {
  osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  osmAttrib = 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';

  create(): any {
    const r = L.tileLayer(this.osmUrl, { minZoom: 1, maxZoom: 19, attribution: this.osmAttrib });
    return r;
  }
}
