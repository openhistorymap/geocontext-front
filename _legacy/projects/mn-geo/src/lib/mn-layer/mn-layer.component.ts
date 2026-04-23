import { Component, Input, ViewChildren, QueryList, ViewContainerRef, OnInit, AfterViewInit, ContentChildren, Output, EventEmitter } from '@angular/core';
import { MnStyleComponent } from '../mn-style/mn-style.component';
import { MnGeoLayersRegistryService, Layer } from '@modalnodes/mn-geo-layers';

@Component({
  selector: 'mn-layer',
  template: '',
  styleUrls: ['./mn-layer.component.css']
})
export class MnLayerComponent implements OnInit, AfterViewInit {

  @Input() name = '';
  @Input() type = '';
  @Input() datasource: string;
  @Input() conf: any = {};

  @Input() setup: any;

  @Output() layerClicked: EventEmitter<any> = new EventEmitter<any>();

  @ContentChildren(MnStyleComponent) styles: QueryList<MnStyleComponent>;

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
  }
  ngAfterViewInit() {
    console.log('styles', this.styles);
    if (this.datasource) {
      this.conf.datasource = this.datasource;
      this.conf.styles = this.styles.map(x => x.style);
    }
    const lyr = this.layers.for(this.type);
    lyr.setClickable(this.layerClicked);
    this._layer = lyr;
    // this.layer.configure(this.conf);
  }
}
