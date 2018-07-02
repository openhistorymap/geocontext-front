import { Component, OnInit, Input, ContentChildren, ElementRef, ViewChild, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { MnLayerComponent } from '../mn-layer/mn-layer.component';
import { MnMapFlavourDirective } from '../mn-map-flavour.directive';
import { MnDatasourceComponent } from '../mn-datasource/mn-datasource.component';

@Component({
  selector: 'mn-map',
  templateUrl: './mn-map.component.html',
  styleUrls: ['./mn-map.component.css']
})
export class MnMapComponent implements OnInit, AfterViewInit {

  constructor() { }

  @Input() public center;
  @Input() public startzoom;
  @Input() public minzoom;
  @Input() public maxzoom;

  @Input() public width = '100%';
  @Input() public height = '300px';

  @ContentChildren(MnMapFlavourDirective) flavour;

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('styles') stylesElement: ElementRef;

  @ViewChildren(MnDatasourceComponent) datasources = new QueryList<MnDatasourceComponent>();
  @ViewChildren(MnLayerComponent) layers = new QueryList<MnLayerComponent>();


  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log("initializing", this.flavour, this.datasources, this.layers);
    this.flavour.first.setup(this);
    this.datasources.forEach((item, idx) => {
      this.flavour.first.addDatasource(item);
    });
    this.layers.forEach((item, idx) => {
      this.flavour.first.addLayer(item);
    });

  }

  getelement(): HTMLElement {
    return this.mapElement.nativeElement;
  }

  getStyles(): HTMLElement {
    return this.stylesElement.nativeElement;
  }

}
