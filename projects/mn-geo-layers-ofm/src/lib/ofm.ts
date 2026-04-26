import { Layer, RasterTilesDescriptor } from '@openhistorymap/mn-geo-layers';

function expandSubdomains(template: string, subdomains?: string): string[] {
  if (!subdomains || !template.includes('{s}')) return [template];
  return [...subdomains].map((s) => template.replace('{s}', s));
}

export class OfmTiles extends Layer {
  static readonly DEFAULT_URL = 'https://tiles.openfantasymaps.org/{z}/{x}/{y}.png';
  static readonly DEFAULT_ATTRIBUTION =
    '© <a href="https://openfantasymaps.org">OpenFantasyMaps</a>';

  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): RasterTilesDescriptor {
    const conf = this.getConfiguration() ?? {};
    const template: string = conf.url ?? OfmTiles.DEFAULT_URL;
    return {
      kind: 'raster-tiles',
      id: this.getName() || 'ofm',
      urls: expandSubdomains(template, conf.subdomains),
      tileSize: conf.tileSize ?? 256,
      minZoom: conf.minZoom ?? 1,
      maxZoom: conf.maxZoom ?? 18,
      attribution: conf.attribution ?? OfmTiles.DEFAULT_ATTRIBUTION,
      subdomains: conf.subdomains,
    };
  }
}
