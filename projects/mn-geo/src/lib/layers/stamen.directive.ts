import { TileDirective } from './tile.directive';
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[stamen]'
})
export class StamenDirective extends TileDirective {

  @Input() style = 'toner';
  constructor() {
    super();
    this.url = 'http://c.tile.stamen.com/' + this.style + '/';
    this.attribution = '';
  }



}
