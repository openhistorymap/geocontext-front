import { Component, inject, OnInit } from '@angular/core';
import { GcxCoreService, GcxMapComponent } from '@openhistorymap/gcx-core';
import { MnGeoFlavoursMaplibreDirective } from '@openhistorymap/mn-geo-flavours-mapbox';

/**
 * Default map route. Loads `/assets/gcx.json` (the local config), then
 * renders `<gcx-map>` with the MapLibre flavour. Swap
 * `MnGeoFlavoursMaplibreDirective` for the Leaflet one if a deployment
 * needs `geomqtt` live-stream layers (those still emit Leaflet-native
 * objects until descriptor support lands).
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
export class MapRouteComponent implements OnInit {
  private readonly gcx = inject(GcxCoreService);

  ngOnInit(): void {
    void this.gcx.load();
  }
}
