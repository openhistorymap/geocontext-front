import * as L from 'leaflet';
import { Layer } from '@modalnodes/mn-geo-layers';

const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';

export class OsmTiles extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): L.Layer {
    return L.tileLayer(OSM_URL, {
      minZoom: 1,
      maxZoom: 19,
      attribution: OSM_ATTRIBUTION,
    });
  }
}

export class OsmVectors extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): any {
    return {};
  }
}

export class OsmOverpass extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(true);
  }

  override create(): any {
    return {};
  }
}
