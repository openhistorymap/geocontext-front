import { Observable } from 'rxjs';
import { tap, map, filter } from 'rxjs/operators';
import { forkJoin, of, interval } from 'rxjs';

import { Layer } from '@modalnodes/mn-geo-layers';
import { 
  Component, 
  OnInit, 
  Input, 
  ContentChildren, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  QueryList, 
  Output, 
  EventEmitter } from '@angular/core';
import { Datasource } from '@modalnodes/mn-geo-datasources';
import { DatasetRegistryService } from './../dataset-registry.service';
import { MnLayerComponent } from '../mn-layer/mn-layer.component';
import { MnMapFlavourDirective } from '../mn-map-flavour.directive';
import { MnDatasourceComponent } from '../mn-datasource/mn-datasource.component';
import { MnGeoDatasourcesRegistryService } from '@modalnodes/mn-geo-datasources';

@Component({
  selector: 'mn-map',
  templateUrl: './mn-map.component.html',
  styleUrls: ['./mn-map.component.css']
})
export class MnMapComponent implements OnInit, AfterViewInit {

  constructor(
    private dsreg: MnGeoDatasourcesRegistryService,
    private dsRegistry: DatasetRegistryService
  ) { }

  @Input() public center;
  @Input() public startzoom;
  @Input() public minzoom;
  @Input() public maxzoom;

  @Input() public width = '100%';
  @Input() public height = '90vh';

  @Output() featureSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() featureUnselected: EventEmitter<any> = new EventEmitter<any>();
  @Output() mapMoveEnd: EventEmitter<any> = new EventEmitter<any>();
  @Output() mapMoveStart: EventEmitter<any> = new EventEmitter<any>();

  @ContentChildren(MnMapFlavourDirective) flavour;

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('styles') stylesElement: ElementRef;

  _map: any;

  @ContentChildren(MnDatasourceComponent) datasources = new QueryList<MnDatasourceComponent>();
  @ContentChildren(MnLayerComponent) layers = new QueryList<MnLayerComponent>();

  ds_temp = [];

  lyrs = [];

  ngOnInit() {
  }


  addDatasource(item) {
    const dd = this.dsreg.for(item.type);
    const da = dd as Datasource;
    console.log('datasource', da);
    da.setName(item.name);
    da.setConf(item.conf);
    this.ds_temp.push(da);
  }

  fetchDatasources() {
    return forkJoin(...this.ds_temp.map(x => {
      return x.fetchData();
    })).pipe(
      filter((r, i) => {
        r.map((o, j) => {
          this.dsRegistry.register(this.ds_temp[j].getName(), o);      
        });
        return true;
      })
    );
  }

  addLayerWithoutDatasources(item) {
    const lyr: Layer = item.layer;
    this.lyrs.push(lyr);
    lyr.setConfiguration(item);
    const flyr = lyr.create();
    this.flavour.first.addLayer(flyr);
  }

  addLayer(item) {
    const lyr: Layer = item.layer;
    this.lyrs.push(lyr);
    lyr.setConfiguration(item.conf);
    if (lyr.getRequiresDatasources()) {
      lyr.setDatasourceRepo(this.dsRegistry);
    }
    const flyr = lyr.create();
    this.flavour.first.addLayer(flyr);
  }
  ngAfterViewInit() {
    this._map = this.flavour.first;
    console.log('initializing', this.flavour, this.datasources, this.layers);
    this._map.setup(this);
    this.datasources.forEach((item, idx) => {
      console.log('datasource', item);
      this.addDatasource(item);
    });
    this.layers.forEach(item => {
      console.log('adding layers without datasources');
      if (!item.layer.getRequiresDatasources()) {
        console.log('adding', item);
        this.addLayerWithoutDatasources(item);
      }
      console.log('done adding layers without datasources');
    });
    this.fetchDatasources().subscribe(res => {
      console.log('figa', res, this.dsRegistry);
      this.layers.forEach(item => {
        console.log('adding layers with datasources');
        if (item.layer.getRequiresDatasources()) {
          console.log('adding', item);
          this.addLayer(item);
        }
        console.log('done adding layers with datasources');
      });
    });
  }

  getelement(): HTMLElement {
    return this.mapElement.nativeElement;
  }

  getStyles(): HTMLElement {
    return this.stylesElement.nativeElement;
  }

  getLayers() {
    return this.lyrs;
  }

  toggleVisibility(layer) {
    // this._map.toggleVisibility();
  }

}
