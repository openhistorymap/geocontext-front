import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  data = {
    'type': '3d',
    'flavour': 'mapboxgl',

    'datasources': [
      'osm'
    ],
    'layers': [
      'osm'
    ]
  };

}
