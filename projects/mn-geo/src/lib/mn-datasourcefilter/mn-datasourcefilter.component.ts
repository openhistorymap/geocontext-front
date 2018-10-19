import { Component, OnInit, Input } from '@angular/core';
import { MnMapComponent } from '../mn-map/mn-map.component';

@Component({
  selector: 'mn-datasourcefilter',
  templateUrl: './mn-datasourcefilter.component.html',
  styleUrls: ['./mn-datasourcefilter.component.css']
})
export class MnDatasourcefilterComponent implements OnInit {

  @Input() map: MnMapComponent;
  @Input() layer: string;

  constructor() { }

  ngOnInit() {
  }

}
