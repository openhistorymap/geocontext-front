import { MnMapComponent } from '@modalnodes/mn-geo';
import { Component, OnInit, Input, ContentChild } from '@angular/core';
import { MatToolbarRow } from '@angular/material/toolbar';

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

  is_opened = false;
  mapgl3d = {};

  title = 'GeoContext';
  gcx_version = '0.0.1';

  @ContentChild('map') map: MnMapComponent;
  @ContentChild('toolbar') toolbar: MatToolbarRow;

  constructor() { }

  ngOnInit() {
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
