import { Directive, ElementRef, Input, forwardRef, HostBinding, OnInit } from '@angular/core';
import { LayerDirective } from './layer.directive';

@Directive({
  selector: '[feature]',
  providers: [{provide: LayerDirective, useExisting: forwardRef(() => FeatureDirective)}]
})
export class FeatureDirective extends LayerDirective implements OnInit {

    @Input() from;

  constructor() { 
    super();
  }

  ngOnInit(){
     console.log('featuredirective');
  }

}
