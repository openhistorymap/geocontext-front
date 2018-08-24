import { GcxCoreService } from './../gcx-core.service';
import { MnMapComponent, MnLayerComponent } from '@modalnodes/mn-geo';
import { Component, OnInit, ContentChild, Input, QueryList, ContentChildren, AfterViewInit, Injectable } from '@angular/core';

@Component({
  selector: 'gcx-gcx-map',
  templateUrl: './gcx-map.component.html',
  styleUrls: ['./gcx-map.component.css']
})
export class GcxMapComponent implements OnInit, AfterViewInit {
  @Input() data: any;

  @Input() center = { lon: 0, lat: 0 };
  @Input() startzoom = 1;
  @Input() minzoom = 1;
  @Input() maxzoom = 1;
  @Input() layers = 1;

  @ContentChild('map') map: MnMapComponent;

  selected_item = null;
  selected_coll = true;

  is_opened = true;
  show_layers = [];
  active = '';
  selectedTab = 1;

  lyrs = [];
  dtss = [];

  constructor(
    private gcx: GcxCoreService
  ) { }

  ngOnInit() {
    this.gcx.sidebarToggled.subscribe(data => {
      this.is_opened = data;
    });

    try {
      this.lyrs = this.gcx.getConf('layers');
      this.dtss = this.gcx.getConf('datasources');
      this.center = this.gcx.getConf('center');
      this.startzoom = this.gcx.getConf('startzoom');
      this.minzoom = this.gcx.getConf('minzoom');
      this.maxzoom = this.gcx.getConf('maxzoom');
      this.lyrs.forEach(x => {
        x.visible = true;
      });
    } catch (ex) {
      console.log(ex);
    }
  }

  toggleVisible(layer) {
    layer.visible = !layer.visible;
    this.map.toggleVisibility(layer);
  }

  setup(center, startzoom, minzoom, maxzoom, layers) {
    this.center = center;
    this.startzoom = startzoom;
    this.minzoom = minzoom;
    this.maxzoom = maxzoom;
  }

  autoload () {
  }

  ngAfterViewInit() {
    // this.show_layers = this.map.getLayers();
  }

  show(event) {
    console.log('click', event);
    this.selectedTab = 2;
    this.gcx.openSidebar();
    this.selected_item = event;
  }

  getKeys(data) {
    return Object.keys(data);
  }

}
