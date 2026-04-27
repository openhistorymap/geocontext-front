import { Directive, forwardRef } from '@angular/core';
import * as L from 'leaflet';
import { MnMapComponent, MnMapFlavourDirective } from '@openhistorymap/mn-geo';
import { isLayerDescriptor, LayerDescriptor } from '@openhistorymap/mn-geo-layers';

/**
 * Leaflet implementation of the MnGeoFlavour interface. Attach inside a
 * `<mn-map>` via `[mnMapFlavourLeaflet]`; the provider below also surfaces
 * it as `MnMapFlavourDirective` so `<mn-map>`'s contentChildren query picks
 * it up as the active flavour.
 *
 * Coordinate convention: `center` on `<mn-map>` is [lon, lat] (matches the
 * legacy `/assets/gcx.json` format); Leaflet takes [lat, lng] so we swap.
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
export class MnGeoFlavoursLeafletDirective extends MnMapFlavourDirective {
  private _map: L.Map | undefined;
  /** Tracks live-update teardowns by the layer group they belong to so
   *  removeLayer can also unsubscribe. */
  private readonly subscriptions = new Map<L.Layer, () => void>();

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
    const [lng, lat] = Array.isArray(center)
      ? center
      : [center.lon ?? center.lng ?? 0, center.lat ?? 0];

    this._map = L.map(element, {
      center: [lat, lng],
      zoom: host.startzoom() ?? 3,
      minZoom: host.minzoom(),
      maxZoom: host.maxzoom(),
    });

    this._map.on('moveend', (e) => host.mapMoveEnd.emit(e));
    this._map.on('movestart', (e) => host.mapMoveStart.emit(e));

    host.ready();
  }

  override addLayer(input: unknown): void {
    if (!this._map) return;
    const layer = isLayerDescriptor(input) ? this.fromDescriptor(input) : (input as L.Layer);
    if (layer) this._map.addLayer(layer);
  }

  override removeLayer(input: unknown): void {
    if (!this._map) return;
    if (input && typeof input === 'object' && 'remove' in input) {
      const layer = input as L.Layer;
      this.subscriptions.get(layer)?.();
      this.subscriptions.delete(layer);
      this._map.removeLayer(layer);
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
        const opts: L.GeoJSONOptions = desc.style?.options
          ? this.geoJsonOptionsFromStyle(desc.style)
          : {};
        if (desc.onClick) {
          opts.onEachFeature = (feature, layer) =>
            layer.on('click', () => desc.onClick!(feature));
        }
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
    }
  }
}
