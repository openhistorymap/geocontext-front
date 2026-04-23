import { Directive, forwardRef } from '@angular/core';
import * as L from 'leaflet';
import { MnMapComponent, MnMapFlavourDirective } from '@modalnodes/mn-geo';
import { isLayerDescriptor, LayerDescriptor } from '@modalnodes/mn-geo-layers';

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

  get leafletMap(): L.Map | undefined {
    return this._map;
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
      this._map.removeLayer(input as L.Layer);
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
        return L.geoJSON(desc.data, {
          onEachFeature: desc.onClick
            ? (feature, layer) => layer.on('click', () => desc.onClick!(feature))
            : undefined,
        });
      }
      case 'vector-tiles': {
        console.warn('mn-geo-flavours-leaflet: vector-tiles descriptor not supported; use maplibre flavour.');
        return null;
      }
    }
  }
}
