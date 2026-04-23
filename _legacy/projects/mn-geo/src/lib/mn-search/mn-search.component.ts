import { MnMapComponent } from './../mn-map/mn-map.component';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mn-search',
  templateUrl: './mn-search.component.html',
  styleUrls: ['./mn-search.component.css']
})
export class MnSearchComponent implements OnInit {

  @Input() map: MnMapComponent;

  constructor() { }

  ngOnInit() {
  }

}
