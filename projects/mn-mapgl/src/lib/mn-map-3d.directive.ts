import { MnMapFlavourDirective } from '@modalnodes/mn-geo';
import { MnMapComponent } from '@modalnodes/mn-geo';
import { Directive, forwardRef } from '@angular/core';

import mapboxgl from 'mapbox-gl';
// or "const mapboxgl = require('mapbox-gl');"


@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[mn-map-3d]',
  providers: [{provide: MnMapFlavourDirective, useExisting: forwardRef(() => MnMap3dDirective)}]
})
export class MnMap3dDirective extends MnMapFlavourDirective {

  constructor() {
    super();
   }

  the_map;

  setup(map: MnMapComponent) {
    console.log("ALE!!!");

    mapboxgl.accessToken = 'pk.eyJ1Ijoic2lybW1vIiwiYSI6ImNpbGY4cmlrbTAwMmh3Z200eGpqcTlyZGgifQ.zLmK4VAZtCUZBpR_GCdytw';
    this.the_map = new mapboxgl.Map({
        container: map.getelement(),
        style: 'mapbox://styles/mapbox/streets-v9'
    });
  }

}
