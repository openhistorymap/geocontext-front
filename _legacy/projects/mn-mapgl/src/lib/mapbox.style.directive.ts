import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[mapbox]'
})
export class MapboxStyleDirective {

  @Input() filter;
  @Input() type;
  @Input() minzoom;
  @Input() maxzoom;
  @Input() style;

  constructor( ) { }

}
