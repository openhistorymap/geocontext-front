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
import { DatasourcesmanagerService } from '@modalnodes/mn-geo-datasources';
import { LayersmanagerService } from '@modalnodes/mn-geo-layers';

@Component({
  selector: 'mn-map',
  templateUrl: './mn-map.component.html',
  styleUrls: ['./mn-map.component.css']
})
export class MnMapComponent implements OnInit, AfterViewInit {

  constructor(
    private dsRegistry: DatasetRegistryService,
    private dsMgr: DatasourcesmanagerService,
    private lyrMgr: LayersmanagerService
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

  ngOnInit() {
    this.dsMgr.setLayermanager(this.lyrMgr);
    this.lyrMgr.setDatasourcemanager(this.dsMgr);
  }

  ngAfterViewInit() {
    this._map = this.flavour.first;
    this.lyrMgr.setFlavour(this._map);
    this._map.setup(this);
  }

  ready() {
    this.layers.forEach(x => {
      this.lyrMgr.addLayer(x);
    });
    this.datasources.forEach(x => {
      this.dsMgr.addDatasource(x);
    });
    this.lyrMgr.displayLayers();
  }

  getelement(): HTMLElement {
    return this.mapElement.nativeElement;
  }

  getStyles(): HTMLElement {
    return this.stylesElement.nativeElement;
  }

  getLayers() {
    return this.lyrMgr.getLayers();
  }

  toggleVisibility(layer) {
    // this._map.toggleVisibility();
  }

}
