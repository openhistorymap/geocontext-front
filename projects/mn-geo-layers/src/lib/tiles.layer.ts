import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { Layer } from './layer.interface';
import {
  ArcgisImageDescriptor,
  BackgroundColorDescriptor,
  ImageOverlayDescriptor,
  RasterDemDescriptor,
  RasterTilesDescriptor,
  WmsTilesDescriptor,
} from './descriptors';
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
 * Solid-colour viewport fill. Layer type `background-color`; emits a
 * `background-color` descriptor that flavours translate to a MapLibre
 * `background` GL layer (no source) or, on Leaflet, a CSS background on
 * the map container. Used by gcx.json's backgrounds[] selector for a
 * "no basemap" option that paints the viewport with the publisher's
 * chosen tint (e.g. swamp green under an archaeological dataset).
 */
export class BackgroundColor extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): BackgroundColorDescriptor {
    const conf = this.getConfiguration() ?? {};
    return {
      kind: 'background-color',
      id: this.getName() || 'background',
      color: conf.color ?? '#ffffff',
      opacity: conf.opacity,
    };
  }
}

/**
 * OGC Web Map Service basemap. Layer type `wms-tiled`; emits a
 * `wms-tiles` descriptor with the WMS request parameters (endpoint,
 * `layers`, `format`, `version`, `crs`, `transparent`, optional `styles`
 * and `params`) — each flavour turns them into a native WMS request
 * (`L.tileLayer.wms` on Leaflet; a per-tile `{bbox-epsg-3857}` raster
 * source on MapLibre).
 */
export class WmsTiles extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): WmsTilesDescriptor {
    const conf = this.getConfiguration() ?? {};
    return {
      kind: 'wms-tiles',
      id: this.getName() || 'wms',
      url: conf.url,
      layers: conf.layers ?? '',
      format: conf.format ?? 'image/png',
      version: conf.version ?? '1.3.0',
      crs: conf.crs ?? 'EPSG:3857',
      styles: conf.styles ?? '',
      transparent: conf.transparent ?? false,
      tileSize: conf.tileSize ?? 256,
      minZoom: conf.minZoom,
      maxZoom: conf.maxZoom,
      attribution: conf.attribution,
      params: conf.params,
    };
  }
}

/**
 * ArcGIS REST ImageServer / MapServer dynamic-image basemap. Layer type
 * `arcgis-image`; emits an `arcgis-image` descriptor that flavours turn
 * into per-tile `exportImage` / `export` requests in EPSG:3857.
 */
export class ArcgisImage extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): ArcgisImageDescriptor {
    const conf = this.getConfiguration() ?? {};
    return {
      kind: 'arcgis-image',
      id: this.getName() || 'arcgis',
      url: conf.url,
      operation: conf.operation ?? 'exportImage',
      format: conf.format ?? 'png32',
      transparent: conf.transparent ?? false,
      tileSize: conf.tileSize ?? 256,
      minZoom: conf.minZoom,
      maxZoom: conf.maxZoom,
      attribution: conf.attribution,
      params: conf.params,
    };
  }
}

/**
 * Single bounded raster image — historical maps, georeferenced aerials.
 * Layer type `image-overlay`; emits an `image-overlay` descriptor that
 * MapLibre renders as an `image` source + raster layer and Leaflet as
 * `L.imageOverlay`. The `bounds` field is `[west, south, east, north]`
 * in WGS84.
 */
export class ImageOverlay extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(false);
  }

  override create(): ImageOverlayDescriptor {
    const conf = this.getConfiguration() ?? {};
    return {
      kind: 'image-overlay',
      id: this.getName() || 'image',
      url: conf.url,
      bounds: conf.bounds,
      opacity: conf.opacity,
      attribution: conf.attribution,
    };
  }
}

/**
 * Registers the renderer-agnostic base tile layer types — `raster-tiled` for
 * arbitrary XYZ raster tiles, `raster-dem` for elevation tiles. These power
 * the top-level `background` and `dem` fields in `gcx.json` and let users
 * declare any tile service without pulling in a provider library.
 *
 * Also registers `background-color` (solid viewport tint) and
 * `image-overlay` (bounded raster) — the two background types used by
 * the gcx.json backgrounds[] selector for non-tile basemaps.
 */
export function provideMnGeoLayersBase(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const reg = inject(MnGeoLayersRegistryService);
    reg.register('raster-tiled', RasterTiles);
    reg.register('raster-dem', DemTiles);
    reg.register('wms-tiled', WmsTiles);
    reg.register('arcgis-image', ArcgisImage);
    reg.register('background-color', BackgroundColor);
    reg.register('image-overlay', ImageOverlay);
  });
}
