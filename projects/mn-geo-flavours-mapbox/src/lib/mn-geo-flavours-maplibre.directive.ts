import { Directive, forwardRef, OnDestroy } from '@angular/core';
import maplibregl, { Map as MaplibreMap, Marker as MaplibreMarker } from 'maplibre-gl';
import { MnMapComponent, MnMapFlavourDirective } from '@openhistorymap/mn-geo';
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
  private readonly subscriptions = new Map<string, () => void>();
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
    // GeoJSON descriptors fan out into <id>-circle/-line/-fill GL layers;
    // remove them all.
    for (const layerId of [id, `${id}-circle`, `${id}-line`, `${id}-fill`]) {
      if (this.ownedLayerIds.has(layerId) && this._map.getLayer(layerId)) {
        this._map.removeLayer(layerId);
        this.ownedLayerIds.delete(layerId);
      }
    }
    if (this.ownedSourceIds.has(id) && this._map.getSource(id)) {
      this._map.removeSource(id);
      this.ownedSourceIds.delete(id);
    }
    // Pin-mode markers: HTML overlays, separate lifecycle from GL layers.
    this.removeMarkers(id);
  }

  override setLayerVisibility(id: string, visible: boolean): void {
    if (!this._map) return;
    const visibility = visible ? 'visible' : 'none';
    // GL layers — descriptor id + geojson sublayers if any.
    for (const layerId of [id, `${id}-circle`, `${id}-line`, `${id}-fill`]) {
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

  override addDatasource(_ds: unknown): void {
    // no-op
  }
  override removeDatasource(_id: unknown): void {
    // no-op
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
          this.ownedLayerIds.add(id);
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
            this.ownedLayerIds.add(layerId);
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
          this.ownedLayerIds.add(circleId);
        }
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
          this.ownedLayerIds.add(lineId);
        }
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
          this.ownedLayerIds.add(fillId);
        }

        // Click handlers for circle/line/fill layers — fire onClick and
        // optionally show a popup at the click point. Popups bind to the
        // event location (lng/lat of the click), not to a marker.
        const popupField = desc.popup?.htmlField ?? 'html';
        if (desc.onClick || desc.popup) {
          for (const sub of [circleId, lineId, fillId]) {
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
