import { Component } from '@angular/core';
import { MnMapComponent, MnLayerComponent } from '@modalnodes/mn-geo';
import { MnGeoFlavoursLeafletDirective } from '@modalnodes/mn-geo-flavours-leaflet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MnMapComponent, MnLayerComponent, MnGeoFlavoursLeafletDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly center: [number, number] = [34.7324, 36.7137];
}
