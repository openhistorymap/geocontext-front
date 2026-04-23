import { Component } from '@angular/core';
import { GcxMapComponent } from '@geocontext/gcx-core';
import { MnGeoFlavoursMaplibreDirective } from '@modalnodes/mn-geo-flavours-mapbox';

/**
 * Thin wrapper that chooses the rendering flavour for `<gcx-map>`.
 * Default is MapLibre-GL. Swap `MnGeoFlavoursMaplibreDirective` for
 * `MnGeoFlavoursLeafletDirective` (from `@modalnodes/mn-geo-flavours-leaflet`)
 * if a given deployment needs Leaflet — e.g. to keep GeoMQTT layers working
 * (GeoMQTT still emits Leaflet-native objects; descriptor support is a
 * follow-up).
 */
@Component({
  selector: 'app-map-route',
  standalone: true,
  imports: [GcxMapComponent, MnGeoFlavoursMaplibreDirective],
  template: `
    <gcx-map>
      <div mnMapFlavourMaplibre></div>
    </gcx-map>
  `,
  styles: [':host { display: block; width: 100%; height: 100%; }'],
})
export class MapRouteComponent {}
