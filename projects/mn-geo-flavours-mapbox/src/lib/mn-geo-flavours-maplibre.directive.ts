import { Directive, forwardRef, OnDestroy } from '@angular/core';
import maplibregl, { Map as MaplibreMap, Marker as MaplibreMarker } from 'maplibre-gl';
import { MnMapComponent, MnMapFlavourDirective, ViewState } from '@openhistorymap/mn-geo';
import {
  buildPopupHtml,
  GeoJsonFeaturesDescriptor,
  isLayerDescriptor,
  LayerDescriptor,
} from '@openhistorymap/mn-geo-layers';

/**
 * Default basemap: OpenFreeMap "bright" — a free, vector, no-API-key OSM
 * cartography (https://openfreemap.org). Used when the gcx.json config
 * has no tile basemap declared, so feature layers always render against
 * something legible.
 *
 * Apps that want a different default can subclass
 * `MnGeoFlavoursMaplibreDirective` and override `setup`, or declare an
 * explicit basemap layer at the top of `layers[]` in their config.
 */
const DEFAULT_BASE_STYLE_URL = 'https://tiles.openfreemap.org/styles/bright';

/**
 * MapLibre-GL implementation of the MnGeoFlavour interface. Attach inside
 * a `<mn-map>` via `[mnMapFlavourMaplibre]`. The library name stays
 * `mn-geo-flavours-mapbox` for npm stability but the implementation is
 * MapLibre-GL — mapbox-gl v2+ is proprietary and we don't carry it.
 *
 * Coordinate convention: `center` is `[lat, lon]` (matches everyday human
 * convention "44°N 13°E" and the rest of GeoContext). Object form
 * `{lat, lon}` also accepted. MapLibre's own constructor wants
 * `[lng, lat]` so we swap at the boundary.
 */
@Directive({
  selector: '[mnMapFlavourMaplibre]',
  standalone: true,
  providers: [
    {
      provide: MnMapFlavourDirective,
      useExisting: forwardRef(() => MnGeoFlavoursMaplibreDirective),
    },
  ],
})
export class MnGeoFlavoursMaplibreDirective extends MnMapFlavourDirective implements OnDestroy {
  private _map: MaplibreMap | undefined;
  private _resizeObserver: ResizeObserver | undefined;
  private _resizePending = false;
  private readonly ownedSourceIds = new Set<string>();
  private readonly ownedLayerIds = new Set<string>();
  /** GL layer IDs we created for each descriptor id, in registration order
   *  (first = bottom of the descriptor's stack). The hard-coded
   *  circle/line/fill triple AND `style.maplibre` custom layers both feed
   *  through this — so removeLayer / setLayerVisibility / setLayerOrder
   *  don't need to enumerate suffix conventions. */
  private readonly glLayersByDescriptorId = new Map<string, string[]>();
  /** Caller's desired stacking, descriptor-id order. Stored so we can
   *  reapply it every time a new GL layer arrives — datasources resolve
   *  async, so layers fan in completion-order rather than declaration
   *  order, and the initial setLayerOrder fires before they exist. */
  private _desiredLayerOrder: string[] | null = null;
  private readonly subscriptions = new Map<string, () => void>();
  /** DEM source id currently bound to the map's terrain (via setTerrain).
   *  Tracked so removeLayer can unset terrain before tearing the source
   *  down — leaving terrain bound to a removed source crashes MapLibre. */
  private terrainSourceId: string | undefined;
  /** Pin-mode layers: each id owns an array of HTML-overlay markers that
   *  setLayerVisibility / removeLayer manage separately from GL layers. */
  private readonly markersByLayerId = new Map<string, MaplibreMarker[]>();

  get maplibreMap(): MaplibreMap | undefined {
    return this._map;
  }

  override setup(host: MnMapComponent): void {
    const element = host.getElement();
    if (!element) {
      throw new Error('mn-geo-flavours-mapbox: host <mn-map> has no rendered element');
    }

    const center = host.center() ?? [0, 0];
    const [lat, lng] = Array.isArray(center)
      ? center
      : [center.lat ?? 0, center.lon ?? center.lng ?? 0];

    this._map = new maplibregl.Map({
      container: element,
      style: DEFAULT_BASE_STYLE_URL,
      center: [lng, lat],
      zoom: host.startzoom() ?? 3,
      minZoom: host.minzoom(),
      maxZoom: host.maxzoom(),
    });

    this._map.on('moveend', (e) => host.mapMoveEnd.emit(e));
    this._map.on('movestart', (e) => host.mapMoveStart.emit(e));

    this._map.once('load', () => {
      host.ready();
      // Belt-and-suspenders: if the parent layout still hadn't settled
      // when the GL canvas was sized, force one more measurement after a
      // microtask + a frame. Cheap, idempotent, and covers cases where
      // the ResizeObserver hadn't observed a delta yet.
      setTimeout(() => this._map?.resize(), 100);
    });

    // MapLibre snapshots the container's clientWidth/Height at construction.
    // If the CSS chain settles a frame later (router-outlet → route component
    // → mat-drawer-container all need pixel dimensions to propagate), the
    // GL canvas locks at that initial snapshot and never grows. A
    // ResizeObserver on the container, debounced to one rAF, keeps the
    // canvas in step with whatever the layout actually computes — and also
    // covers later changes (sidebar toggles, viewport resizes).
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        if (this._resizePending) return;
        this._resizePending = true;
        requestAnimationFrame(() => {
          this._resizePending = false;
          this._map?.resize();
        });
      });
      this._resizeObserver.observe(element);
    }
  }

  override addLayer(input: unknown): void {
    if (!this._map) return;
    if (!isLayerDescriptor(input)) {
      console.warn(
        'mn-geo-flavours-mapbox: ignoring non-descriptor layer input. ' +
          'MapLibre requires LayerDescriptor; native renderer objects are not accepted.',
      );
      return;
    }
    this.fromDescriptor(input);
  }

  override removeLayer(input: unknown): void {
    if (!this._map) return;
    const id = typeof input === 'string' ? input : (input as { id?: string })?.id;
    if (!id) return;
    this.subscriptions.get(id)?.();
    this.subscriptions.delete(id);
    // Tear down every GL layer we registered under this descriptor —
    // the geometry-typed circle/line/fill triple, or whatever custom
    // layers `style.maplibre` declared.
    for (const layerId of this.glLayersByDescriptorId.get(id) ?? []) {
      if (this._map.getLayer(layerId)) this._map.removeLayer(layerId);
      this.ownedLayerIds.delete(layerId);
    }
    this.glLayersByDescriptorId.delete(id);
    if (this.ownedSourceIds.has(id) && this._map.getSource(id)) {
      if (this.terrainSourceId === id) {
        try { this._map.setTerrain(null); } catch { /* ignore */ }
        this.terrainSourceId = undefined;
      }
      this._map.removeSource(id);
      this.ownedSourceIds.delete(id);
    }
    // Pin-mode markers: HTML overlays, separate lifecycle from GL layers.
    this.removeMarkers(id);
  }

  override setLayerVisibility(id: string, visible: boolean): void {
    if (!this._map) return;
    const visibility = visible ? 'visible' : 'none';
    for (const layerId of this.glLayersByDescriptorId.get(id) ?? []) {
      if (this._map.getLayer(layerId)) {
        this._map.setLayoutProperty(layerId, 'visibility', visibility);
      }
    }
    // Pin markers — HTML overlays toggled via inline display so they go
    // away cleanly without re-creating them.
    const markers = this.markersByLayerId.get(id);
    if (markers) {
      for (const m of markers) m.getElement().style.display = visible ? '' : 'none';
    }
  }

  override setLayerOrder(ids: string[]): void {
    this._desiredLayerOrder = ids.slice();
    this.applyLayerOrder();
  }

  /** Restack already-registered GL layers to match `_desiredLayerOrder`.
   *  Called by setLayerOrder AND by trackGlLayer as new layers arrive,
   *  so the requested order survives the async datasource pipeline.
   *
   *  moveLayer(id) without a `beforeId` moves the layer to the top of
   *  the stack. Walking the desired stack from bottom to top, and
   *  within each descriptor walking its GL layers in registration
   *  order, means the last-registered sublayer of `ids[0]` ends up
   *  topmost overall. Pin markers are HTML overlays above the canvas;
   *  their stacking is DOM-order, separate from GL layers. */
  private applyLayerOrder(): void {
    if (!this._map || !this._desiredLayerOrder) return;
    const ids = this._desiredLayerOrder;
    for (let i = ids.length - 1; i >= 0; i--) {
      for (const layerId of this.glLayersByDescriptorId.get(ids[i]) ?? []) {
        if (this._map.getLayer(layerId)) {
          try { this._map.moveLayer(layerId); } catch { /* ignore */ }
        }
      }
    }
  }

  override getView(): ViewState | null {
    if (!this._map) return null;
    const c = this._map.getCenter();
    return {
      zoom: this._map.getZoom(),
      lat: c.lat,
      lon: c.lng,
      bearing: this._map.getBearing(),
      pitch: this._map.getPitch(),
    };
  }

  override setView(view: Partial<ViewState>): void {
    if (!this._map) return;
    const c = this._map.getCenter();
    this._map.jumpTo({
      center: [view.lon ?? c.lng, view.lat ?? c.lat],
      zoom: view.zoom ?? this._map.getZoom(),
      bearing: view.bearing ?? this._map.getBearing(),
      pitch: view.pitch ?? this._map.getPitch(),
    });
  }

  override addDatasource(_ds: unknown): void {
    // no-op
  }
  override removeDatasource(_id: unknown): void {
    // no-op
  }

  /** Register a freshly-added GL layer under its descriptor so the rest
   *  of the lifecycle (visibility / order / remove) can find it without
   *  hard-coded suffix conventions. Reapplies the host's desired stack
   *  order so async-fanning-in layers don't end up in completion order. */
  private trackGlLayer(descId: string, layerId: string): void {
    this.ownedLayerIds.add(layerId);
    const list = this.glLayersByDescriptorId.get(descId);
    if (list) list.push(layerId);
    else this.glLayersByDescriptorId.set(descId, [layerId]);
    this.applyLayerOrder();
  }

  ngOnDestroy(): void {
    for (const unsub of this.subscriptions.values()) {
      try {
        unsub();
      } catch {
        // ignore
      }
    }
    this.subscriptions.clear();
    for (const id of [...this.markersByLayerId.keys()]) this.removeMarkers(id);
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    this._map?.remove();
    this._map = undefined;
  }

  /**
   * Render Point features as HTML-overlay pin markers with bound popups.
   * Used for descriptors with `marker: 'pins'`. Non-Point geometries are
   * skipped (pins don't make sense on lines/polygons). Markers are tracked
   * in `markersByLayerId` so removeLayer / setLayerVisibility can manage
   * them separately from GL layers.
   */
  private renderPinMarkers(id: string, desc: GeoJsonFeaturesDescriptor): void {
    const map = this._map!;
    const popupField = desc.popup?.htmlField ?? 'html';

    // Replace any previously-rendered markers for this id (live updates +
    // re-renders shouldn't leak overlay nodes).
    this.removeMarkers(id);

    const features: any[] = desc.data?.features ?? [];
    const owned: MaplibreMarker[] = [];
    for (const feature of features) {
      if (feature?.geometry?.type !== 'Point') continue;
      const coords = feature.geometry.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) continue;

      const marker = new maplibregl.Marker({ color: this.markerColorFor(desc) })
        .setLngLat([coords[0], coords[1]]);

      if (desc.popup) {
        const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '320px' })
          .setHTML(buildPopupHtml(feature, popupField));
        marker.setPopup(popup);
      }

      if (desc.onClick) {
        marker.getElement().addEventListener('click', (ev) => {
          ev.stopPropagation();
          desc.onClick!(feature);
        });
      }

      marker.addTo(map);
      owned.push(marker);
    }
    this.markersByLayerId.set(id, owned);

    if (desc.subscribe) {
      const unsub = desc.subscribe((data: any) => {
        const next: GeoJsonFeaturesDescriptor = { ...desc, data };
        this.renderPinMarkers(id, next);
      });
      this.subscriptions.set(id, unsub);
    }
  }

  /** Pick the marker pin colour from the descriptor's style options, with
   *  the editorial terracotta as the fallback so pins always read. */
  private markerColorFor(desc: GeoJsonFeaturesDescriptor): string {
    return (
      desc.style?.options?.fillColor ??
      desc.style?.options?.color ??
      desc.style?.fillColor ??
      desc.style?.color ??
      '#9b3f2c'
    );
  }

  private removeMarkers(id: string): void {
    const owned = this.markersByLayerId.get(id);
    if (!owned) return;
    for (const m of owned) m.remove();
    this.markersByLayerId.delete(id);
  }

  private fromDescriptor(desc: LayerDescriptor): void {
    const map = this._map!;
    switch (desc.kind) {
      case 'raster-tiles': {
        const id = desc.id;
        if (!map.getSource(id)) {
          map.addSource(id, {
            type: 'raster',
            tiles: desc.urls,
            tileSize: desc.tileSize ?? 256,
            minzoom: desc.minZoom,
            maxzoom: desc.maxZoom,
            attribution: desc.attribution,
          });
          this.ownedSourceIds.add(id);
        }
        if (!map.getLayer(id)) {
          map.addLayer({
            id,
            type: 'raster',
            source: id,
            minzoom: desc.minZoom,
            maxzoom: desc.maxZoom,
          });
          this.trackGlLayer(id, id);
        }
        return;
      }

      case 'vector-tiles': {
        const id = desc.id;
        if (!map.getSource(id)) {
          map.addSource(id, {
            type: 'vector',
            tiles: desc.urls,
            minzoom: desc.minZoom,
            maxzoom: desc.maxZoom,
            attribution: desc.attribution,
          });
          this.ownedSourceIds.add(id);
        }
        for (const styleLayer of desc.styleLayers ?? []) {
          const layerId = styleLayer.id ?? `${id}-${this.ownedLayerIds.size}`;
          if (!map.getLayer(layerId)) {
            map.addLayer({ ...styleLayer, id: layerId, source: id });
            this.trackGlLayer(id, layerId);
          }
        }
        return;
      }

      case 'raster-dem': {
        // DEM is two halves: a raster-dem source (always added so terrain /
        // hillshade can attach to it) and an optional hillshade GL layer.
        // setLayerOrder/Visibility key off `desc.id`, which is the hillshade
        // layer when present — so toggling the sidebar row hides the visible
        // shading without disturbing the underlying source.
        const sourceId = desc.id;
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'raster-dem',
            tiles: desc.urls,
            tileSize: desc.tileSize ?? 256,
            encoding: desc.encoding ?? 'terrarium',
            minzoom: desc.minZoom,
            maxzoom: desc.maxZoom,
            attribution: desc.attribution,
          });
          this.ownedSourceIds.add(sourceId);
        }
        if (desc.hillshade !== false && !map.getLayer(sourceId)) {
          map.addLayer({
            id: sourceId,
            type: 'hillshade',
            source: sourceId,
            paint: {
              'hillshade-shadow-color': '#473b24',
            },
          });
          this.trackGlLayer(sourceId, sourceId);
        }
        if (desc.terrain) {
          try {
            map.setTerrain({ source: sourceId, exaggeration: desc.exaggeration ?? 1 });
            this.terrainSourceId = sourceId;
          } catch (e) {
            console.warn('mn-geo-flavours-mapbox: setTerrain failed', e);
          }
        }
        return;
      }

      case 'geojson-features': {
        const id = desc.id;

        // Pin mode: use HTML-overlay markers (`maplibregl.Marker`) and the
        // built-in popup, instead of GL circle layers. Non-Point geometries
        // are skipped because pins only make sense on points.
        if (desc.marker === 'pins') {
          this.renderPinMarkers(id, desc);
          return;
        }

        if (map.getSource(id)) {
          (map.getSource(id) as maplibregl.GeoJSONSource).setData(desc.data);
        } else {
          map.addSource(id, { type: 'geojson', data: desc.data });
          this.ownedSourceIds.add(id);
        }

        // Two style paths: a `style.maplibre` array on the layer
        // expresses raw GL style-spec layers and is forwarded as-is
        // (escape hatch for expressions, heatmaps, etc.). Absent, we
        // synthesise the geometry-typed circle/line/fill triple from
        // the high-level `style.options` block. Either way the
        // resulting GL layer ids live in `glLayersByDescriptorId`,
        // so the lifecycle methods don't need to know which path
        // produced them.
        const customLayers = normaliseMaplibreLayers(desc.style?.maplibre);
        const sublayerIds: string[] = [];
        if (customLayers.length) {
          customLayers.forEach((spec, i) => {
            const layerId = `${id}-ml-${i}`;
            if (!map.getLayer(layerId)) {
              map.addLayer({
                ...(spec as any),
                id: layerId,
                source: id,
              });
              this.trackGlLayer(id, layerId);
            }
            sublayerIds.push(layerId);
          });
        } else {
          const circleId = `${id}-circle`;
          if (!map.getLayer(circleId)) {
            map.addLayer({
              id: circleId,
              type: 'circle',
              source: id,
              filter: ['==', ['geometry-type'], 'Point'],
              paint: {
                'circle-radius': desc.style?.options?.radius ?? 4,
                'circle-color': desc.style?.options?.fillColor ?? '#099092',
                'circle-stroke-color': desc.style?.options?.color ?? '#000',
                'circle-stroke-width': desc.style?.options?.weight ?? 1,
              },
            });
            this.trackGlLayer(id, circleId);
          }
          sublayerIds.push(circleId);
          const lineId = `${id}-line`;
          if (!map.getLayer(lineId)) {
            map.addLayer({
              id: lineId,
              type: 'line',
              source: id,
              filter: ['==', ['geometry-type'], 'LineString'],
              paint: {
                'line-color': desc.style?.options?.color ?? '#333',
                'line-width': desc.style?.options?.weight ?? 2,
              },
            });
            this.trackGlLayer(id, lineId);
          }
          sublayerIds.push(lineId);
          const fillId = `${id}-fill`;
          if (!map.getLayer(fillId)) {
            map.addLayer({
              id: fillId,
              type: 'fill',
              source: id,
              filter: ['==', ['geometry-type'], 'Polygon'],
              paint: {
                'fill-color': desc.style?.options?.fillColor ?? '#099092',
                'fill-opacity': desc.style?.options?.fillOpacity ?? 0.4,
              },
            });
            this.trackGlLayer(id, fillId);
          }
          sublayerIds.push(fillId);
        }

        // Click handlers — bound to every sublayer produced for this
        // descriptor (the auto-generated triple, or the custom-maplibre
        // layers). Popups bind to the event location (lng/lat of the
        // click), not to a marker.
        const popupField = desc.popup?.htmlField ?? 'html';
        if (desc.onClick || desc.popup) {
          for (const sub of sublayerIds) {
            map.on('click', sub, (e) => {
              const feat = e.features?.[0];
              if (!feat) return;
              if (desc.popup) {
                new maplibregl.Popup({ closeButton: true, maxWidth: '320px' })
                  .setLngLat(e.lngLat)
                  .setHTML(buildPopupHtml(feat, popupField))
                  .addTo(map);
              }
              if (desc.onClick) desc.onClick(feat);
            });
            map.on('mouseenter', sub, () => (map.getCanvas().style.cursor = 'pointer'));
            map.on('mouseleave', sub, () => (map.getCanvas().style.cursor = ''));
          }
        }

        if (desc.subscribe) {
          // Live channel: each push replaces the source's data; the
          // existing GL layers (circle/line/fill) re-render automatically.
          const unsub = desc.subscribe((data) => {
            const src = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
            src?.setData(data);
          });
          this.subscriptions.set(id, unsub);
        }
        return;
      }
    }
  }
}

/**
 * Coerce the `style.maplibre` escape hatch into an array of layer-spec
 * partials. Accepts either a single object or an array; returns `[]` when
 * absent so the caller's `if (customLayers.length)` branch reads naturally.
 *
 * Each entry should look like a MapLibre style-spec layer minus `id` and
 * `source` (we fill those in). `type` is required; `paint`, `layout`,
 * `filter`, `minzoom`, `maxzoom` are forwarded as-is. Entries without a
 * `type` are dropped with a warning — MapLibre would crash on them
 * anyway, and dropping is friendlier to the rest of the layer.
 */
function normaliseMaplibreLayers(input: any): any[] {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : [input];
  return arr.filter((spec) => {
    if (spec && typeof spec === 'object' && typeof spec.type === 'string') return true;
    console.warn(
      'mn-geo-flavours-mapbox: ignoring style.maplibre entry without `type`',
      spec,
    );
    return false;
  });
}
