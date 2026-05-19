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

/**
 * Digital Elevation Model raster tiles. Tile pixels encode elevation values
 * (terrarium or mapbox-rgb), used by the renderer for hillshading and
 * optional 3D terrain. Flavours that don't speak DEM (Leaflet today) ignore
 * this descriptor with a warning.
 */
export interface RasterDemDescriptor {
  kind: 'raster-dem';
  id: string;
  urls: string[];
  /** Pixel encoding. `terrarium` (default) is the AWS / Mapzen scheme;
   *  `mapbox` is the Mapbox terrain-rgb scheme. */
  encoding?: 'terrarium' | 'mapbox';
  tileSize?: number;
  minZoom?: number;
  maxZoom?: number;
  attribution?: string;
  /** Render a hillshade GL layer from the source. Default: true. Set to
   *  false to register the DEM source for terrain only. */
  hillshade?: boolean;
  /** Enable 3D terrain (MapLibre `setTerrain`). Default: false. */
  terrain?: boolean;
  /** Vertical exaggeration when `terrain: true`. Default: 1. */
  exaggeration?: number;
}

/**
 * Solid-colour fill covering the entire map viewport, drawn beneath
 * everything else (when placed at the bottom of the stack). Used for
 * "no basemap" / background-as-context, e.g. a swamp tint under an
 * archaeological dataset where the underlying ground was wet plain.
 * MapLibre uses its native `background` layer type (no source); Leaflet
 * sets the map container's CSS background.
 */
export interface BackgroundColorDescriptor {
  kind: 'background-color';
  id: string;
  color: string;
  opacity?: number;
}

/**
 * Single bounded raster image — a georeferenced historical map, an
 * aerial photo, etc. — pinned to a rectangular geographic extent.
 * MapLibre wires it as an `image` source + `raster` layer; Leaflet as
 * `L.imageOverlay`. `bounds` is `[west, south, east, north]` in WGS84
 * decimal degrees.
 */
export interface ImageOverlayDescriptor {
  kind: 'image-overlay';
  id: string;
  url: string;
  bounds: [number, number, number, number];
  opacity?: number;
  attribution?: string;
}

export interface GeoJsonFeaturesDescriptor {
  kind: 'geojson-features';
  id: string;
  data: any;
  style?: any;
  /**
   * Visualisation mode for Point geometries. `circles` (default) renders
   * styled circle / line / fill primitives — the existing FeatureLayer
   * behaviour. `pins` renders traditional clickable map pins (Leaflet
   * `L.marker`, MapLibre `maplibregl.Marker`). LineString and Polygon
   * features are unaffected by this hint.
   */
  marker?: 'circles' | 'pins';
  /**
   * Bind a popup to each rendered feature. Content comes from
   * `popup.htmlField` on the feature properties if non-empty, otherwise
   * a property summary is rendered (same shape as the sidebar Details
   * tab). Omit the field entirely to skip popup binding.
   */
  popup?: {
    /** Property name to read raw HTML from. Defaults to `'html'`. */
    htmlField?: string;
  };
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
  | RasterDemDescriptor
  | BackgroundColorDescriptor
  | ImageOverlayDescriptor
  | GeoJsonFeaturesDescriptor;

export function isLayerDescriptor(value: unknown): value is LayerDescriptor {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    typeof (value as { kind: unknown }).kind === 'string'
  );
}
