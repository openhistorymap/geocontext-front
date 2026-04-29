import { Directive } from '@angular/core';
import type { MnGeoFlavour } from './mn-geo-flavour.interface';
import type { MnMapComponent } from './mn-map/mn-map.component';

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
}
