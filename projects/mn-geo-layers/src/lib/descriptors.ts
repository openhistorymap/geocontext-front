/**
 * Renderer-agnostic layer shapes that `Layer.create()` may emit. Flavours
 * translate these into their native layer representations at addLayer time.
 *
 * Layer classes may also emit a native renderer object (e.g. an L.Layer for
 * Leaflet-specific live layers like GeoMQTT). A flavour that doesn't know
 * how to handle a given input should ignore it and warn once.
 */

export interface RasterTilesDescriptor {
  kind: 'raster-tiles';
  id: string;
  urls: string[];
  tileSize?: number;
  minZoom?: number;
  maxZoom?: number;
  attribution?: string;
  subdomains?: string | string[];
}

export interface VectorTilesDescriptor {
  kind: 'vector-tiles';
  id: string;
  urls: string[];
  styleLayers: any[];
  minZoom?: number;
  maxZoom?: number;
  attribution?: string;
}

export interface GeoJsonFeaturesDescriptor {
  kind: 'geojson-features';
  id: string;
  data: any;
  style?: any;
  onClick?: (feature: any) => void;
  /**
   * Optional live-update channel. The flavour calls `subscribe` once after
   * adding the layer; the layer pushes new FeatureCollections through `push`
   * whenever its underlying data changes (e.g. an MQTT message arrives).
   * The returned thunk should tear down the subscription. Layers that emit
   * static data omit this field entirely.
   */
  subscribe?: (push: (data: any) => void) => () => void;
}

export type LayerDescriptor =
  | RasterTilesDescriptor
  | VectorTilesDescriptor
  | GeoJsonFeaturesDescriptor;

export function isLayerDescriptor(value: unknown): value is LayerDescriptor {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    typeof (value as { kind: unknown }).kind === 'string'
  );
}
