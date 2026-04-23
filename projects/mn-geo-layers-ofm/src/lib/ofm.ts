import * as L from 'leaflet';
import { Layer } from '@modalnodes/mn-geo-layers';

/**
 * OpenFantasyMaps tile layer. The XYZ URL template, zoom bounds, and
 * attribution come from the layer `conf` so the same class can back any
 * OFM backend (main grid, OHM variant, fantasy renders).
 */
export class OfmTiles extends Layer {
  static readonly DEFAULT_URL = 'https://tiles.openfantasymaps.org/{z}/{x}/{y}.png';
  static readonly DEFAULT_ATTRIBUTION =
    '© <a href="https://openfantasymaps.org">OpenFantasyMaps</a>';

  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): L.Layer {
    const conf = this.getConfiguration() ?? {};
    return L.tileLayer(conf.url ?? OfmTiles.DEFAULT_URL, {
      minZoom: conf.minZoom ?? 1,
      maxZoom: conf.maxZoom ?? 18,
      attribution: conf.attribution ?? OfmTiles.DEFAULT_ATTRIBUTION,
      subdomains: conf.subdomains,
      tileSize: conf.tileSize ?? 256,
    });
  }
}
