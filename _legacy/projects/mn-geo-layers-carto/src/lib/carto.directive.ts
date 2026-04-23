import { LayerComponent } from './layer.directive';
import { Component, forwardRef } from '@angular/core';

@Component({
  selector: '[mnCarto]',
  providers: [{ provide: LayerComponent, useExisting: forwardRef(() => CartoComponent) }],
  template: '',
  styles: [],
})
export class CartoComponent {

  constructor() { }

}
