import { Directive } from '@angular/core';

import { MnMapComponent } from './mn-map/mn-map.component';

@Directive({
  selector: '[mnMnMapFlavour]'
})
export class MnMapFlavourDirective {

  constructor() { }

  setup(map: MnMapComponent) {
    console.log('SETTING UP');
  }

}
