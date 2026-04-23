import { MnMapComponent } from '@modalnodes/mn-geo';
import { Component, OnInit, Input, ContentChild, ComponentRef } from '@angular/core';
import { MatToolbarRow } from '@angular/material/toolbar';
import { GcxCoreService } from '../gcx-core.service';

@Component({
  selector: 'gcx-main',
  templateUrl: './gcx-main.component.html',
  styleUrls: ['./gcx-main.component.css']
})
export class GcxMainComponent implements OnInit {

  @Input() data: any;

  @Input() center = {lon: 0, lat: 0};
  @Input() startzoom = 1;
  @Input() minzoom = 1;
  @Input() maxzoom = 1;
  @Input() layers = 1;

  @Input() autoload = false;

  is_opened = false;

  title = 'GeoContext';
  gcx_version = '0.0.1';

  @Input() items = [];

  @ContentChild('toolbar') toolbar: MatToolbarRow;

  constructor(
    public gcx: GcxCoreService
  ) { }

  ngOnInit() {
    if (this.autoload) {
      this.title = this.gcx.getConf('title');
      this.center = this.gcx.getConf('center');
      this.startzoom = this.gcx.getConf('startzoom');
      this.minzoom = this.gcx.getConf('minzoom');
      this.maxzoom = this.gcx.getConf('maxzoom');
    } else {
      if (this.data) {
        if (this.data.center) {
          this.center = this.data.center;
        }
        if (this.data.startzoom) {
          this.startzoom = this.data.startzoom;
        }
        if (this.data.minzoom) {
          this.minzoom = this.data.minzoom;
        }
        if (this.data.maxzoom) {
          this.maxzoom = this.data.maxzoom;
        }
        if (this.data.layers) {
          this.layers = this.data.layers;
        }
      }
    }
  }

  onActivate(componentRef: any) {
    if (componentRef.constructor.name === 'GcxMapCompoent') {
      if (this.autoload) {
        componentRef.autoload();
      } else {
        componentRef.setup(this.center, this.startzoom, this.minzoom, this.maxzoom, this.layers);
      }
    }
  }


}
