import { Layer } from '@modalnodes/mn-geo-layers';
import { MnMapFlavourDirective } from '@modalnodes/mn-geo';
import { MnMapComponent } from '@modalnodes/mn-geo';
import { Directive, ViewContainerRef, forwardRef } from '@angular/core';

import * as L from 'leaflet';


@Directive({
  selector: '[mn-map-2d]',
  providers: [{provide: MnMapFlavourDirective, useExisting: forwardRef(() => MnMap2dDirective)}]
})
export class MnMap2dDirective extends MnMapFlavourDirective {

  css = 'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css';

  the_map;

  constructor(
    private _view: ViewContainerRef
  ) {
    super();
  }


  setup(map: MnMapComponent) {
    const d = map.getStyles();
    const style = document.createElement('link');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('href', this.css);
    d.appendChild(style);

    this.the_map = L.map(map.getelement()).setView(map.center, map.startzoom);
    map.ready();
  }

  addLayer(layer: Layer) {
    this.the_map.addLayer(layer);
  }

  addDataset(datasource: any) {

  }

}
