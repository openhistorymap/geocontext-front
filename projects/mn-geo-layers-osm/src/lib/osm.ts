import { Layer, RasterTilesDescriptor } from '@openhistorymap/mn-geo-layers';

const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_SUBDOMAINS = 'abc';
const OSM_ATTRIBUTION =
  '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';

function expandSubdomains(template: string, subdomains: string): string[] {
  if (!template.includes('{s}')) return [template];
  return [...subdomains].map((s) => template.replace('{s}', s));
}

export class OsmTiles extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): RasterTilesDescriptor {
    const conf = this.getConfiguration() ?? {};
    const template: string = conf.url ?? OSM_URL;
    const subdomains: string = conf.subdomains ?? OSM_SUBDOMAINS;
    return {
      kind: 'raster-tiles',
      id: this.getName() || 'osm',
      urls: expandSubdomains(template, subdomains),
      tileSize: conf.tileSize ?? 256,
      minZoom: conf.minZoom ?? 1,
      maxZoom: conf.maxZoom ?? 19,
      attribution: conf.attribution ?? OSM_ATTRIBUTION,
      subdomains,
    };
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
