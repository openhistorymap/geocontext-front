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
  @Input() datasource: string;
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
    console.log(this.styles);
    if (this.setup) {
      this.conf = this.setup.conf;
      this.type = this.setup.type;
      this.name = this.setup.name;
    }
    if (this.datasource) {
      this.conf.datasource = this.datasource;
      this.conf.styles = this.styles;
    }
    const lyr = this.layers.for(this.type);
    this._layer = lyr;
    // this.layer.configure(this.conf);
  }
}
