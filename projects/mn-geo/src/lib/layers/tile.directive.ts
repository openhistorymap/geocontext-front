import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[tile]'
})
export class TileDirective {

  @Input() url = '';
  @Input() attribution = '';

  constructor() { }

}
