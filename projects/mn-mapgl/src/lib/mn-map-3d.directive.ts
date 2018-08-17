import { Layer } from '@modalnodes/mn-geo-layers';
import { MnMapFlavourDirective } from '@modalnodes/mn-geo';
import { MnMapComponent } from '@modalnodes/mn-geo';
import { Directive, forwardRef, ViewContainerRef, Input } from '@angular/core';

import mapboxgl from 'mapbox-gl';
// or "const mapboxgl = require('mapbox-gl');"


@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[mn-map-3d]',
  providers: [{provide: MnMapFlavourDirective, useExisting: forwardRef(() => MnMap3dDirective)}]
})
export class MnMap3dDirective extends MnMapFlavourDirective {

  css = 'https://api.mapbox.com/mapbox-gl-js/v0.42.0/mapbox-gl.css';

  @Input() mapboxToken = '';

  the_map;

  constructor(
    private _view: ViewContainerRef
  ) {
    super();
  }

  ngOnInit() {
    console.log('mn-map-3d', this.mapboxToken);
  }

  setup(map: MnMapComponent) {
    const d = map.getStyles();
    const style = document.createElement('link');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('href', this.css);
    d.appendChild(style);

    mapboxgl.accessToken = this.mapboxToken;
    this.the_map = new mapboxgl.Map({
        container: map.getelement()
    });
  }

  addLayer(layer: Layer) {
    this.the_map.addLayer({
      id: layer
    });
  }
  removeLayer(id: any) {}
  addDatasource(datasource: any) {
    this.the_map.addSource(datasource);
  }
  removeDatasource(id: any) { }

}
