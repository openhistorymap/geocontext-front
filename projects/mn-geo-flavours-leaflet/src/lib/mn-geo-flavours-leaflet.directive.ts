import { Directive, forwardRef, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import {
  LayerFilterPredicate,
  MnMapComponent,
  MnMapFlavourDirective,
  ViewState,
} from '@openhistorymap/mn-geo';
import {
  ArcgisImageDescriptor,
  buildPopupHtml,
  isLayerDescriptor,
  LayerDescriptor,
} from '@openhistorymap/mn-geo-layers';

interface GeoJsonState {
  group: L.FeatureGroup;
  data: any;
  opts: L.GeoJSONOptions;
}

/**
 * Leaflet implementation of the MnGeoFlavour interface. Attach inside a
 * `<mn-map>` via `[mnMapFlavourLeaflet]`; the provider below also surfaces
 * it as `MnMapFlavourDirective` so `<mn-map>`'s contentChildren query picks
 * it up as the active flavour.
 *
 * Coordinate convention: `center` is `[lat, lon]` (matches everyday human
 * convention "44°N 13°E" and Leaflet's own LatLng order). Object form
 * `{lat, lon}` also accepted.
 */
@Directive({
  selector: '[mnMapFlavourLeaflet]',
  standalone: true,
  providers: [
    {
      provide: MnMapFlavourDirective,
      useExisting: forwardRef(() => MnGeoFlavoursLeafletDirective),
    },
  ],
})
export class MnGeoFlavoursLeafletDirective extends MnMapFlavourDirective implements OnDestroy {
  private _map: L.Map | undefined;
  private _resizeObserver: ResizeObserver | undefined;
  private _resizePending = false;
  /** Tracks live-update teardowns by the layer group they belong to so
   *  removeLayer can also unsubscribe. */
  private readonly subscriptions = new Map<L.Layer, () => void>();
  /** Tracks Leaflet layer instances by descriptor id so setLayerVisibility
   *  can show/hide them after they've been added. */
  private readonly layersById = new Map<string, L.Layer>();
  /** Caller's desired stacking, descriptor-id order. Reapplied as new
   *  layers register so async-resolving datasources don't leave the
   *  stack in completion order. Same intent as the MapLibre flavour. */
  private _desiredLayerOrder: string[] | null = null;
  /** Caller's desired visibility per descriptor id. Looked up by
   *  addLayer when the L.Layer registers, so `layer.visible: false`
   *  in gcx.json takes effect even though setLayerVisibility ran
   *  before the datasource resolved. */
  private readonly desiredVisibility = new Map<string, boolean>();
  /** Latest data + opts for each geojson-features descriptor, plus the
   *  L.featureGroup that hosts the rendered inner L.geoJSON layer. Used
   *  by setLayerFilter (rebuild with a `filter` opt) and by the
   *  descriptor's `subscribe` channel (rebuild with new data). Leaflet's
   *  L.geoJSON only honours `filter` at construction, so any per-feature
   *  selection change forces a clearLayers + recreate. */
  private readonly geojsonStates = new Map<string, GeoJsonState>();
  /** Active equality predicate per descriptor id. Looked up at render
   *  time so live-update pushes also respect the user's filter. */
  private readonly activeFilters = new Map<string, LayerFilterPredicate>();
  /** Descriptor id of the active `background-color` overlay (Leaflet
   *  has no native background layer, so we paint the container CSS).
   *  removeLayer resets the CSS when this id is torn down. */
  private _bgColorId: string | undefined;

  get leafletMap(): L.Map | undefined {
    return this._map;
  }

  private geoJsonOptionsFromStyle(style: any, interactive: boolean): L.GeoJSONOptions {
    const o = style.options ?? {};
    return {
      pointToLayer: (_feature, latlng) =>
        L.circleMarker(latlng, {
          radius: o.radius ?? 4,
          fillColor: o.fillColor ?? '#099092',
          color: o.color ?? '#000',
          weight: o.weight ?? 1,
          opacity: o.opacity ?? 1,
          fillOpacity: o.fillOpacity ?? 0.6,
          interactive,
        }),
      style: () => ({
        color: o.color ?? '#333',
        weight: o.weight ?? 2,
        fillColor: o.fillColor ?? '#099092',
        fillOpacity: o.fillOpacity ?? 0.4,
        interactive,
      }),
    };
  }

  override setup(host: MnMapComponent): void {
    const element = host.getElement();
    if (!element) {
      throw new Error('mn-geo-flavours-leaflet: host <mn-map> has no rendered element');
    }

    const center = host.center() ?? [0, 0];
    const [lat, lng] = Array.isArray(center)
      ? center
      : [center.lat ?? 0, center.lon ?? center.lng ?? 0];

    this._map = L.map(element, {
      center: [lat, lng],
      zoom: host.startzoom() ?? 3,
      minZoom: host.minzoom(),
      maxZoom: host.maxzoom(),
    });

    this._map.on('moveend', (e) => host.mapMoveEnd.emit(e));
    this._map.on('movestart', (e) => host.mapMoveStart.emit(e));

    host.ready();
    // Belt-and-suspenders: if the parent layout still hadn't settled
    // when the tile layer was sized, force one more measurement.
    setTimeout(() => this._map?.invalidateSize(), 100);

    // Same defensive resize as the MapLibre flavour: Leaflet caches the
    // container size at L.map() construction; if the CSS chain settles
    // a frame later, the tile layer locks at that initial size and never
    // grows. ResizeObserver → invalidateSize keeps the map in step.
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        if (this._resizePending) return;
        this._resizePending = true;
        requestAnimationFrame(() => {
          this._resizePending = false;
          this._map?.invalidateSize();
        });
      });
      this._resizeObserver.observe(element);
    }
  }

  ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    for (const unsub of this.subscriptions.values()) {
      try { unsub(); } catch { /* ignore */ }
    }
    this.subscriptions.clear();
    this._map?.remove();
    this._map = undefined;
  }

  override addLayer(input: unknown): void {
    if (!this._map) return;
    let id: string | undefined;
    let layer: L.Layer | null = null;
    if (isLayerDescriptor(input)) {
      id = input.id;
      layer = this.fromDescriptor(input);
    } else if (input && typeof input === 'object' && 'addTo' in input) {
      layer = input as L.Layer;
    }
    if (layer) {
      this._map.addLayer(layer);
      if (id) {
        this.layersById.set(id, layer);
        this.applyLayerOrder();
        // If the host previously requested this id be hidden
        // (`layer.visible: false` in gcx.json arriving before the
        // datasource resolved), apply the state now.
        if (this.desiredVisibility.get(id) === false) {
          this._map.removeLayer(layer);
        }
      }
    }
  }

  override removeLayer(input: unknown): void {
    if (!this._map) return;
    if (typeof input === 'string') {
      const layer = this.layersById.get(input);
      if (layer) {
        this.subscriptions.get(layer)?.();
        this.subscriptions.delete(layer);
        this._map.removeLayer(layer);
        this.layersById.delete(input);
      }
      // Background-color side-effect: clear the container CSS so the
      // next basemap (tile / image / nothing) doesn't leak the prior tint.
      if (input === this._bgColorId) {
        this._map.getContainer().style.backgroundColor = '';
        this._bgColorId = undefined;
      }
      this.geojsonStates.delete(input);
      this.activeFilters.delete(input);
      return;
    }
    if (input && typeof input === 'object' && 'remove' in input) {
      const layer = input as L.Layer;
      this.subscriptions.get(layer)?.();
      this.subscriptions.delete(layer);
      this._map.removeLayer(layer);
      // Drop any id mapping that pointed at this layer.
      for (const [id, l] of this.layersById) {
        if (l === layer) {
          this.layersById.delete(id);
          this.geojsonStates.delete(id);
          this.activeFilters.delete(id);
        }
      }
    }
  }

  override setLayerVisibility(id: string, visible: boolean): void {
    // Remember the request — `addLayer` reapplies it when the L.Layer
    // is eventually registered (async datasource pipeline). Same
    // intent as the MapLibre flavour's desiredVisibility.
    this.desiredVisibility.set(id, visible);
    if (!this._map) return;
    const layer = this.layersById.get(id);
    if (!layer) return;
    if (visible) {
      if (!this._map.hasLayer(layer)) this._map.addLayer(layer);
    } else if (this._map.hasLayer(layer)) {
      this._map.removeLayer(layer);
    }
  }

  override setLayerOrder(ids: string[]): void {
    this._desiredLayerOrder = ids.slice();
    this.applyLayerOrder();
  }

  /** Restack already-registered Leaflet layers to match
   *  `_desiredLayerOrder`. Called by setLayerOrder AND by addLayer as
   *  new layers register, so the requested order survives the async
   *  datasource pipeline.
   *
   *  Leaflet stacks within a pane: tile layers in `tilePane` (z 200),
   *  overlays in `overlayPane` (z 400). Walking from the bottom of the
   *  requested stack upward, each iteration lifts the layer above all
   *  already-promoted ones — so the final iteration (ids[0]) ends up
   *  on top of its pane. Tile layers don't support `bringToFront`, so
   *  we fall back to `setZIndex(rank)` for them. */
  private applyLayerOrder(): void {
    if (!this._map || !this._desiredLayerOrder) return;
    const ids = this._desiredLayerOrder;
    for (let i = ids.length - 1; i >= 0; i--) {
      const layer = this.layersById.get(ids[i]) as any;
      if (!layer) continue;
      if (typeof layer.bringToFront === 'function') {
        layer.bringToFront();
      } else if (typeof layer.setZIndex === 'function') {
        layer.setZIndex(ids.length - i);
      }
    }
  }

  override setLayerFilter(id: string, predicate: LayerFilterPredicate | null): void {
    if (predicate) this.activeFilters.set(id, predicate);
    else this.activeFilters.delete(id);
    const state = this.geojsonStates.get(id);
    if (state) this.renderGeoJson(state, predicate);
  }

  /** Clear and rebuild a geojson-features group with `state.data` and
   *  `state.opts` augmented by an optional equality predicate. L.geoJSON
   *  only honours `filter` at construction, so any per-feature visibility
   *  change forces this rebuild. Comparison is string-coerced so the
   *  predicate matches what the user sees in the Details tab. */
  private renderGeoJson(
    state: GeoJsonState,
    predicate: LayerFilterPredicate | null,
  ): void {
    state.group.clearLayers();
    const opts: L.GeoJSONOptions = predicate
      ? {
          ...state.opts,
          filter: (f: any) =>
            String(f?.properties?.[predicate.property]) === String(predicate.value),
        }
      : state.opts;
    L.geoJSON(state.data, opts).addTo(state.group);
  }

  override getView(): ViewState | null {
    if (!this._map) return null;
    const c = this._map.getCenter();
    return {
      zoom: this._map.getZoom(),
      lat: c.lat,
      lon: c.lng,
      // Leaflet is 2D — no camera rotation or tilt.
      bearing: 0,
      pitch: 0,
    };
  }

  override setView(view: Partial<ViewState>): void {
    if (!this._map) return;
    const current = this._map.getCenter();
    const lat = view.lat ?? current.lat;
    const lon = view.lon ?? current.lng;
    const zoom = view.zoom ?? this._map.getZoom();
    // bearing/pitch silently ignored — Leaflet has no equivalent.
    this._map.setView([lat, lon], zoom, { animate: false });
  }

  override addDatasource(_ds: unknown): void {
    // no-op: datasources feed layers, not the map directly
  }

  override removeDatasource(_id: unknown): void {
    // no-op
  }

  private fromDescriptor(desc: LayerDescriptor): L.Layer | null {
    switch (desc.kind) {
      case 'background-color': {
        // Leaflet has no native "background" layer. Apply the colour to
        // the map container's CSS — it paints through any pixel not
        // covered by a tile / overlay layer. The sentinel L.layerGroup
        // keeps the lifecycle (visibility / order / remove) symmetric
        // with other layer types; removeLayer below clears the CSS when
        // this descriptor is torn down.
        if (this._map) {
          this._map.getContainer().style.backgroundColor = desc.color;
          this._bgColorId = desc.id;
        }
        return L.layerGroup();
      }
      case 'image-overlay': {
        const [w, s, e, n] = desc.bounds;
        // L.imageOverlay takes [[south,west],[north,east]] — opposite
        // corners, lat,lon (Leaflet's convention everywhere).
        const overlay = L.imageOverlay(desc.url, [[s, w], [n, e]], {
          opacity: desc.opacity ?? 1,
          attribution: desc.attribution,
          interactive: false,
        });
        return overlay;
      }
      case 'raster-tiles': {
        const template = desc.urls[0];
        return L.tileLayer(template, {
          subdomains: desc.subdomains ?? 'abc',
          minZoom: desc.minZoom,
          maxZoom: desc.maxZoom,
          attribution: desc.attribution,
          tileSize: desc.tileSize,
        });
      }
      case 'wms-tiles': {
        // L.tileLayer.wms speaks the WMS GetMap protocol natively (BBOX
        // per tile, axis-order handling, transparent PNGs). We forward
        // the descriptor's connection params straight to it; extra
        // vendor-specific keys (CQL_FILTER, TIME, …) ride along in
        // `params` and are merged into the GetMap query.
        const wmsOpts: L.WMSOptions = {
          layers: desc.layers,
          format: desc.format ?? 'image/png',
          version: desc.version ?? '1.3.0',
          transparent: desc.transparent ?? false,
          crs: leafletCrsFor(desc.crs),
          styles: desc.styles ?? '',
          minZoom: desc.minZoom,
          maxZoom: desc.maxZoom,
          attribution: desc.attribution,
          tileSize: desc.tileSize,
          ...(desc.params ?? {}),
        };
        return L.tileLayer.wms(desc.url, wmsOpts);
      }
      case 'arcgis-image': {
        // Leaflet has no native ArcGIS REST adapter (esri-leaflet ships
        // one, but it's a heavy extra dependency for one tile shape).
        // Building a small L.TileLayer subclass that overrides
        // getTileUrl with the right exportImage/export call shape is
        // smaller code than the dep would be.
        return buildArcgisTileLayer(desc);
      }
      case 'geojson-features': {
        const isPinMode = desc.marker === 'pins';
        const popupField = desc.popup?.htmlField ?? 'html';
        // A descriptor with no click handler and no popup is context only —
        // Leaflet's L.Path defaults to interactive:true (pointer-events:auto
        // on the SVG), which both shifts the cursor to pointer on hover and
        // shadows clicks on layers below. Setting interactive:false on the
        // path/marker options gives the user the right semantics: visible
        // geometry, no hit testing, clicks pass through.
        const interactive = !!(desc.onClick || desc.popup);

        const opts: L.GeoJSONOptions = isPinMode
          ? {
              // Traditional pin markers — Leaflet's default L.marker icon.
              pointToLayer: (_feature, latlng) => L.marker(latlng, { interactive }),
            }
          : desc.style?.options
            ? this.geoJsonOptionsFromStyle(desc.style, interactive)
            : this.geoJsonOptionsFromStyle({}, interactive);

        const onEach: NonNullable<L.GeoJSONOptions['onEachFeature']> = (
          feature,
          layer,
        ) => {
          if (desc.popup) {
            layer.bindPopup(() => buildPopupHtml(feature, popupField), {
              maxWidth: 320,
              className: 'gcx-leaflet-popup',
            });
          }
          if (desc.onClick) {
            layer.on('click', () => desc.onClick!(feature));
          }
        };
        if (desc.popup || desc.onClick) opts.onEachFeature = onEach;

        const group = L.featureGroup();
        const state: GeoJsonState = { group, data: desc.data, opts };
        this.geojsonStates.set(desc.id, state);
        this.renderGeoJson(state, this.activeFilters.get(desc.id) ?? null);
        if (desc.subscribe) {
          // Live channel: replace the projected geojson layer on each push.
          // Returned teardown is held alongside the group so removeLayer
          // can stop the subscription. The user's active filter (if any)
          // is re-evaluated against the freshly-pushed FeatureCollection.
          const unsub = desc.subscribe((data) => {
            state.data = data;
            this.renderGeoJson(state, this.activeFilters.get(desc.id) ?? null);
          });
          this.subscriptions.set(group, unsub);
        }
        return group;
      }
      case 'vector-tiles': {
        console.warn('mn-geo-flavours-leaflet: vector-tiles descriptor not supported; use maplibre flavour.');
        return null;
      }
      case 'raster-dem': {
        console.warn('mn-geo-flavours-leaflet: raster-dem descriptor not supported; use maplibre flavour for DEM / hillshade.');
        return null;
      }
    }
  }
}

/**
 * Resolve a WMS `CRS` string (`EPSG:3857`, `EPSG:4326`) to the matching
 * Leaflet CRS object. Defaults to L.CRS.EPSG3857 — the Web-Mercator
 * grid that GeoContext's slippy-map setup already uses — so a missing
 * or unknown value Just Works on the common case. EPSG:900913 is the
 * legacy non-conforming alias for 3857 some older WMS deployments
 * still emit.
 */
function leafletCrsFor(crs?: string): L.CRS {
  const k = (crs ?? '').toUpperCase();
  if (k === 'EPSG:4326') return L.CRS.EPSG4326;
  if (k === 'EPSG:3857' || k === 'EPSG:900913' || k === '') return L.CRS.EPSG3857;
  // Unrecognised — let the WMS server reject it cleanly rather than
  // silently coercing to a different grid.
  console.warn(`mn-geo-flavours-leaflet: unknown WMS CRS "${crs}", falling back to EPSG:3857`);
  return L.CRS.EPSG3857;
}

/** Half-world width in EPSG:3857 (Web Mercator) metres. */
const WEB_MERCATOR_HALF = 20037508.342789244;

/**
 * Construct a Leaflet TileLayer that fetches each tile from an ArcGIS
 * REST ImageServer / MapServer dynamic-image endpoint. We subclass
 * L.TileLayer and override `getTileUrl` so the slippy-map tile
 * coordinate (x, y, z) is rewritten into the bbox-and-size GetImage
 * call ArcGIS expects.
 */
function buildArcgisTileLayer(desc: ArcgisImageDescriptor): L.Layer {
  const size = desc.tileSize ?? 256;
  const op = desc.operation ?? 'exportImage';
  const baseParams: Record<string, string> = {
    f: 'image',
    bboxSR: '3857',
    imageSR: '3857',
    size: `${size},${size}`,
    format: desc.format ?? 'png32',
    transparent: desc.transparent ? 'true' : 'false',
  };
  for (const [k, v] of Object.entries(desc.params ?? {})) {
    baseParams[k] = String(v);
  }
  const baseQuery = Object.entries(baseParams)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  const ArcgisTileLayer = L.TileLayer.extend({
    getTileUrl(coords: L.Coords): string {
      const n = Math.pow(2, coords.z);
      const tileWorld = (WEB_MERCATOR_HALF * 2) / n;
      const xmin = -WEB_MERCATOR_HALF + coords.x * tileWorld;
      const xmax = xmin + tileWorld;
      // Slippy-map Y grows southward; in Web Mercator metres ymax is at
      // the top of the tile (north), ymin at the bottom (south).
      const ymax = WEB_MERCATOR_HALF - coords.y * tileWorld;
      const ymin = ymax - tileWorld;
      const bbox = `${xmin},${ymin},${xmax},${ymax}`;
      return `${desc.url}/${op}?${baseQuery}&bbox=${bbox}`;
    },
  });

  return new (ArcgisTileLayer as any)('', {
    tileSize: size,
    minZoom: desc.minZoom,
    maxZoom: desc.maxZoom,
    attribution: desc.attribution,
  });
}
