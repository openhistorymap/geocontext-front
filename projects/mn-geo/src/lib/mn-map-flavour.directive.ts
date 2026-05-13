import { Directive } from '@angular/core';
import type { MnGeoFlavour } from './mn-geo-flavour.interface';
import type { MnMapComponent } from './mn-map/mn-map.component';

/**
 * Renderer-agnostic snapshot of where the user is currently looking. `lat`/`lon`
 * are decimal degrees (WGS84); `zoom` is the renderer's native zoom level
 * (Leaflet and MapLibre share the slippy-map convention). `bearing` and
 * `pitch` are degrees — both are 0 on flavours without 3D camera control
 * (currently: Leaflet). Used by hash-based URL state sync.
 */
export interface ViewState {
  zoom: number;
  lat: number;
  lon: number;
  bearing: number;
  pitch: number;
}

/**
 * Marker directive used by `<mn-map>` to project a flavour child via
 * `contentChildren(MnMapFlavourDirective, { descendants: true })`.
 * Flavour libraries declare a component/directive that extends this and
 * implements `MnGeoFlavour`.
 */
@Directive({
  selector: '[mnMapFlavour]',
  standalone: true,
})
export abstract class MnMapFlavourDirective implements MnGeoFlavour {
  abstract setup(map: MnMapComponent): void;
  abstract addLayer(layer: any): void;
  abstract removeLayer(id: any): void;
  abstract addDatasource(datasource: any): void;
  abstract removeDatasource(id: any): void;

  /**
   * Show or hide a layer that was previously added with `addLayer`. The
   * `id` is the descriptor's id (FeatureLayer uses the layer name). The
   * default is a no-op so flavours that don't support visibility toggling
   * still satisfy the interface; concrete flavours override.
   */
  setLayerVisibility(_id: string, _visible: boolean): void {
    /* override in concrete flavour */
  }

  /**
   * Reorder previously added layers to match `ids`. `ids[0]` ends up
   * drawn on top (matches "first row in the sidebar = topmost layer").
   * Layers not in `ids` keep their relative order. Default is a no-op
   * so flavours that don't support reordering still satisfy the
   * interface; concrete flavours override.
   */
  setLayerOrder(_ids: string[]): void {
    /* override in concrete flavour */
  }

  /**
   * Current camera position, or null when the underlying map hasn't been
   * constructed yet. Flavours without a 3D camera report `bearing` and
   * `pitch` as 0. Default returns null; concrete flavours override.
   */
  getView(): ViewState | null {
    return null;
  }

  /**
   * Move the camera. Partial inputs are allowed — missing fields keep
   * their current value. Calls before the underlying map exists are
   * silently dropped, so consumers can fire-and-forget during init.
   * Default is a no-op; concrete flavours override.
   */
  setView(_view: Partial<ViewState>): void {
    /* override in concrete flavour */
  }
}
