import { Layer, RasterTilesDescriptor } from '@openhistorymap/mn-geo-layers';

const SUBDOMAINS = 'abcd';
const ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors © <a href="https://carto.com/attributions">CARTO</a>';

function template(style: string): string {
  return `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}.png`;
}

function expandSubdomains(tpl: string, sd: string): string[] {
  return [...sd].map((s) => tpl.replace('{s}', s));
}

function describe(style: string): (this: Layer) => RasterTilesDescriptor {
  return function (this: Layer) {
    const conf = this.getConfiguration() ?? {};
    const tpl: string = conf.url ?? template(style);
    const subdomains: string = conf.subdomains ?? SUBDOMAINS;
    return {
      kind: 'raster-tiles',
      id: this.getName() || `carto-${style}`,
      urls: expandSubdomains(tpl, subdomains),
      tileSize: conf.tileSize ?? 256,
      minZoom: conf.minZoom ?? 1,
      maxZoom: conf.maxZoom ?? 20,
      attribution: conf.attribution ?? ATTRIBUTION,
      subdomains,
    };
  };
}

class CartoLayer extends Layer {
  protected style: string = 'voyager';
  constructor() {
    super();
    this.setRequiresDatasources(false);
  }
  override create(): RasterTilesDescriptor {
    return describe(this.style).call(this);
  }
}

export class CartoVoyager extends CartoLayer {
  protected override style = 'voyager';
}
export class CartoVoyagerNoLabels extends CartoLayer {
  protected override style = 'voyager_nolabels';
}
export class CartoLight extends CartoLayer {
  protected override style = 'light_all';
}
export class CartoLightNoLabels extends CartoLayer {
  protected override style = 'light_nolabels';
}
export class CartoDark extends CartoLayer {
  protected override style = 'dark_all';
}
export class CartoDarkNoLabels extends CartoLayer {
  protected override style = 'dark_nolabels';
}
export class CartoPositron extends CartoLayer {
  protected override style = 'rastertiles/positron';
}
