import { Directive, ElementRef, Input, forwardRef, HostBinding, OnInit } from '@angular/core';
import { LayerDirective } from './layer.directive';

@Directive({
  selector: '[heatmap]',
  providers: [{provide: LayerDirective, useExisting: forwardRef(() => HeatmapDirective)}]
})
export class HeatmapDirective extends LayerDirective {
  
  @Input() from;

  constructor() {
    super();
   }

}
