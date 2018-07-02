import { Component, AfterViewInit, Input, ContentChildren, ViewChildren, QueryList } from '@angular/core';
import { MnStyleComponent } from '../mn-style/mn-style.component';
import { LayerDirective } from '../layers/layer.directive';

@Component({
  selector: 'mn-layer',
  template: '',
  styleUrls: ['./mn-layer.component.css']
})
export class MnLayerComponent implements AfterViewInit {

  
  @Input() name = '';
  @ContentChildren(LayerDirective) dirs  = new QueryList<LayerDirective>();

  @ViewChildren(MnStyleComponent) styles = new QueryList<MnStyleComponent>();


  constructor() { }

  ngAfterViewInit() {
    console.log("layer", this.name, this.dirs, this.styles);
  }

}
