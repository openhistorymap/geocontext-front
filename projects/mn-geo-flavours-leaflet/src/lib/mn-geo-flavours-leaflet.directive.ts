import { Directive, forwardRef, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { MnMapComponent, MnMapFlavourDirective } from '@openhistorymap/mn-geo';
import {
  buildPopupHtml,
  isLayerDescriptor,
  LayerDescriptor,
} from '@openhistorymap/mn-geo-layers';

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

  get leafletMap(): L.Map | undefined {
    return this._map;
  }

  private geoJsonOptionsFromStyle(style: any): L.GeoJSONOptions {
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
        }),
      style: () => ({
        color: o.color ?? '#333',
        weight: o.weight ?? 2,
        fillColor: o.fillColor ?? '#099092',
        fillOpacity: o.fillOpacity ?? 0.4,
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
      if (id) this.layersById.set(id, layer);
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
      return;
    }
    if (input && typeof input === 'object' && 'remove' in input) {
      const layer = input as L.Layer;
      this.subscriptions.get(layer)?.();
      this.subscriptions.delete(layer);
      this._map.removeLayer(layer);
      // Drop any id mapping that pointed at this layer.
      for (const [id, l] of this.layersById) {
        if (l === layer) this.layersById.delete(id);
      }
    }
  }

  override setLayerVisibility(id: string, visible: boolean): void {
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
    if (!this._map) return;
    // Leaflet stacks within a pane: tile layers in `tilePane` (z 200),
    // overlays in `overlayPane` (z 400). Walking from the bottom of the
    // requested stack upward, each iteration lifts the layer above all
    // already-promoted ones — so the final iteration (ids[0]) ends up
    // on top of its pane. Tile layers don't support `bringToFront`, so
    // we fall back to `setZIndex(rank)` for them.
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

  override addDatasource(_ds: unknown): void {
    // no-op: datasources feed layers, not the map directly
  }

  override removeDatasource(_id: unknown): void {
    // no-op
  }

  private fromDescriptor(desc: LayerDescriptor): L.Layer | null {
    switch (desc.kind) {
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
      case 'geojson-features': {
        const isPinMode = desc.marker === 'pins';
        const popupField = desc.popup?.htmlField ?? 'html';

        const opts: L.GeoJSONOptions = isPinMode
          ? {
              // Traditional pin markers — Leaflet's default L.marker icon.
              pointToLayer: (_feature, latlng) => L.marker(latlng),
            }
          : desc.style?.options
            ? this.geoJsonOptionsFromStyle(desc.style)
            : {};

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
        L.geoJSON(desc.data, opts).addTo(group);
        if (desc.subscribe) {
          // Live channel: replace the projected geojson layer on each push.
          // Returned teardown is held alongside the group so removeLayer
          // can stop the subscription.
          const unsub = desc.subscribe((data) => {
            group.clearLayers();
            L.geoJSON(data, opts).addTo(group);
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
