import { LayerComponent } from './layer.directive';
import { TileComponent } from './tile.directive';
import { Component, Input, forwardRef } from '@angular/core';

@Component({
  selector: '[stamen]',
  providers: [
    { provide: LayerComponent, useExisting: forwardRef(() => StamenComponent) },
    { provide: TileComponent, useExisting: forwardRef(() => StamenComponent) },
  ],
  template: '',
  styles: [],
})
export class StamenComponent extends TileComponent {

  @Input() style = 'toner';
  constructor() {
    super();
    this.url = 'http://c.tile.stamen.com/' + this.style + '/';
    this.attribution = '';
  }



}
