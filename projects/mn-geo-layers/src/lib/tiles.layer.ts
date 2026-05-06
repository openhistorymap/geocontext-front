import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { Layer } from './layer.interface';
import { RasterDemDescriptor, RasterTilesDescriptor } from './descriptors';
import { MnGeoLayersRegistryService } from './mn-geo-layers-registry.service';

function expandSubdomains(template: string, subdomains?: string): string[] {
  if (!subdomains || !template.includes('{s}')) return [template];
  return [...subdomains].map((s) => template.replace('{s}', s));
}

/**
 * Generic XYZ raster tile layer driven entirely by configuration. Used for
 * the top-level `background` field in `gcx.json` when the user supplies a
 * raw URL, and available as a layer type (`raster-tiled`) for arbitrary tile
 * services that don't warrant a dedicated provider library.
 */
export class RasterTiles extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): RasterTilesDescriptor {
    const conf = this.getConfiguration() ?? {};
    const url: string = conf.url;
    const subdomains: string | undefined = conf.subdomains;
    return {
      kind: 'raster-tiles',
      id: this.getName() || 'raster',
      urls: expandSubdomains(url, subdomains),
      tileSize: conf.tileSize ?? 256,
      minZoom: conf.minZoom,
      maxZoom: conf.maxZoom,
      attribution: conf.attribution,
      subdomains,
    };
  }
}

/**
 * Digital Elevation Model tile layer. Emits a `raster-dem` descriptor that
 * MapLibre turns into a `raster-dem` source plus an optional hillshade and
 * 3D terrain. Fed from `gcx.json`'s top-level `dem` key by `<gcx-map>`, or
 * used directly as a layer type (`raster-dem`).
 */
export class DemTiles extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): RasterDemDescriptor {
    const conf = this.getConfiguration() ?? {};
    const url: string = conf.url;
    const subdomains: string | undefined = conf.subdomains;
    return {
      kind: 'raster-dem',
      id: this.getName() || 'dem',
      urls: expandSubdomains(url, subdomains),
      encoding: conf.encoding ?? 'terrarium',
      tileSize: conf.tileSize ?? 256,
      minZoom: conf.minZoom,
      maxZoom: conf.maxZoom,
      attribution: conf.attribution,
      hillshade: conf.hillshade ?? true,
      terrain: conf.terrain ?? false,
      exaggeration: conf.exaggeration ?? 1,
    };
  }
}

/**
 * Registers the renderer-agnostic base tile layer types — `raster-tiled` for
 * arbitrary XYZ raster tiles, `raster-dem` for elevation tiles. These power
 * the top-level `background` and `dem` fields in `gcx.json` and let users
 * declare any tile service without pulling in a provider library.
 */
export function provideMnGeoLayersBase(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const reg = inject(MnGeoLayersRegistryService);
    reg.register('raster-tiled', RasterTiles);
    reg.register('raster-dem', DemTiles);
  });
}
