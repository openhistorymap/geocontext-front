import { Component, Input, OnInit, ContentChild, TemplateRef } from '@angular/core';

import { MnMapComponent } from './../mn-map/mn-map.component';

@Component({
  selector: 'mn-layerswitcher',
  templateUrl: './mn-layerswitcher.component.html',
  styleUrls: ['./mn-layerswitcher.component.css']
})
export class MnLayerswitcherComponent implements OnInit {

  @Input() map: MnMapComponent;
  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor() { }

  ngOnInit() {
  }

  get layers() {
    return this.map.getLayers();
  }

}
