import { Component, Input,  ViewChildren, QueryList, ViewContainerRef, OnInit } from '@angular/core';
import { MnStyleComponent } from '../mn-style/mn-style.component';
import { MnGeoLayersRegistryService, Layer } from '@modalnodes/mn-geo-layers';

@Component({
  selector: 'mn-layer',
  template: '',
  styleUrls: ['./mn-layer.component.css']
})
export class MnLayerComponent implements OnInit {

  @Input() name = '';
  @Input() type = '';
  @Input() conf: any = {};

  @Input() setup: any;

  @ViewChildren(MnStyleComponent) styles = new QueryList<MnStyleComponent>();

  private _layer: Layer;

  get layer(): Layer {
    return this._layer;
  }

  constructor(
    protected viewContainer: ViewContainerRef,
    private layers: MnGeoLayersRegistryService
  ) {
  }

  ngOnInit() {
    if (this.setup) {
      this.conf = this.setup.conf;
      this.type = this.setup.type;
      this.name = this.setup.name;
    }
    this._layer = new (this.layers.for(this.type))();
    // this.layer.configure(this.conf);
  }
}
