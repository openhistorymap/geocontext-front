import { Component, ElementRef, Input, forwardRef, HostBinding, OnInit } from '@angular/core';
import { LayerComponent } from './layer.directive';

@Component({
  selector: '[feature]',
  providers: [{ provide: LayerComponent, useExisting: forwardRef(() => FeatureComponent) }],
  template: '',
  styles: [],
})
export class FeatureComponent extends LayerComponent implements OnInit {

    @Input() from;

  constructor() { 
    super();
  }

  ngOnInit(){
     console.log('featuredirective');
  }

}
