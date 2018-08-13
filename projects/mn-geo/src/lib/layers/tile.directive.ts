import { LayerComponent } from './layer.directive';
import { Component, Input, forwardRef } from '@angular/core';

@Component({
  selector: '[tile]',
  template: '',
  styles: [],
  providers: [
    { provide: LayerComponent, useExisting: forwardRef(() => TileComponent) },
  ]
})
export class TileComponent extends LayerComponent {

  @Input() url = '';
  @Input() attribution = '';

  constructor() {
    super();
   }

}
