import { Directive, forwardRef } from '@angular/core';
import * as L from 'leaflet';
import { MnMapComponent, MnMapFlavourDirective } from '@modalnodes/mn-geo';

/**
 * Leaflet implementation of the MnGeoFlavour interface. Attach it inside a
 * `<mn-map>` via `[mnMapFlavourLeaflet]`; the provider below also surfaces it
 * as `MnMapFlavourDirective` so `<mn-map>`'s contentChildren query picks it
 * up as the active flavour.
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

  override addLayer(layer: L.Layer): void {
    this._map?.addLayer(layer);
  }

  override removeLayer(layer: L.Layer): void {
    this._map?.removeLayer(layer);
  }

  override addDatasource(_ds: unknown): void {
    // no-op: datasources feed layers, not the map directly
  }

  override removeDatasource(_id: unknown): void {
    // no-op
  }
}
