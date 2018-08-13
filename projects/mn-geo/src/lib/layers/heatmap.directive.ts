import { Component, ElementRef, Input, forwardRef, HostBinding, OnInit } from '@angular/core';
import { LayerComponent } from './layer.directive';

@Component({
  selector: '[heatmap]',
  providers: [{ provide: LayerComponent, useExisting: forwardRef(() => HeatmapComponent) }],
  template: '',
  styles: [],
})
export class HeatmapComponent extends LayerComponent {
  
  @Input() from;

  constructor() {
    super();
   }

}