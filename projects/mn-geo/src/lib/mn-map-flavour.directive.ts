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
}
