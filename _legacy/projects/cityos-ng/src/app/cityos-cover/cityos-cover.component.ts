import { CityosService } from './../cityos.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cityos-cover',
  templateUrl: './cityos-cover.component.html',
  styleUrls: ['./cityos-cover.component.css']
})
export class CityosCoverComponent implements OnInit {

  measures = [
  ]

  constructor(
    public cityos: CityosService
  ) { }

  ngOnInit() {
    this.cityos.locations.subscribe(d => {
      this.measures.push({name: 'Locations', value: d.length});
    });
    this.cityos.mappers.subscribe(d => {
      this.measures.push({name: 'Mappers', value: d.length});
    });
    this.cityos.mappingspaces.subscribe(d => {
      this.measures.push({name: 'Spaces', value: d.length});
    });
  }

}
