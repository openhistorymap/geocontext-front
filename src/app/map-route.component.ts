import { Component } from '@angular/core';
import { GcxMapComponent } from '@geocontext/gcx-core';
import { MnGeoFlavoursLeafletDirective } from '@modalnodes/mn-geo-flavours-leaflet';

/**
 * Thin wrapper that chooses the rendering flavour (Leaflet here) for
 * `<gcx-map>`. Swap this component for a MapLibre variant to change
 * backends without touching gcx-core.
 */
@Component({
  selector: 'app-map-route',
  standalone: true,
  imports: [GcxMapComponent, MnGeoFlavoursLeafletDirective],
  template: `
    <gcx-map>
      <div mnMapFlavourLeaflet></div>
    </gcx-map>
  `,
  styles: [':host { display: block; width: 100%; height: 100%; }'],
})
export class MapRouteComponent {}
