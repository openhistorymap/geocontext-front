import type { MnMapComponent } from './mn-map/mn-map.component';

/**
 * The rendering-backend adapter: a flavour plugs the `<mn-map>` container
 * into a concrete map library (Leaflet, MapLibre-GL, …). Flavours live in
 * their own libraries (`mn-geo-flavours-*`) and are declared inside a
 * `<mn-map>` via the `[mnMapFlavour]` directive.
 */
export interface MnGeoFlavour {
  setup(map: MnMapComponent): void;

  addLayer(layer: any): void;
  removeLayer(id: any): void;

  addDatasource(datasource: any): void;
  removeDatasource(id: any): void;

  /** Show / hide a previously added layer by descriptor id (typically the
   *  layer name). Optional: a flavour that doesn't support live toggling
   *  may omit it. */
  setLayerVisibility?(id: string, visible: boolean): void;

  /** Reorder previously added layers to match `ids` — `ids[0]` ends up
   *  drawn on top (matches the visual convention "first row in the
   *  sidebar = topmost layer"). Layers not in `ids` keep their relative
   *  order. Optional: a flavour without live reordering may omit it. */
  setLayerOrder?(ids: string[]): void;
}
