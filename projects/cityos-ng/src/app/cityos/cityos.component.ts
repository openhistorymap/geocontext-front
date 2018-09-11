import { tap } from 'rxjs/operators';
import { CityosService } from './../cityos.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cityos',
  templateUrl: './cityos.component.html',
  styleUrls: ['./cityos.component.css']
})
export class CityosComponent implements OnInit {

  mode = 'global';
  active_map = null;
  active_loc = null;
  active_mda = null;

  data_map = null;
  data_map_locs = null;
  data_loc = null;
  data_mda = null;

  logo = false;

  constructor(
    private route: ActivatedRoute,
    private cityos: CityosService,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(data => {
      console.log(data);
      if (data.mapname) {
        this.mode = 'map';
        this.active_map = data.mapname;
        this.data_map = this.cityos.getMappingSpace(this.active_map).pipe(tap(data2 => {
          this.logo = data2.logo;
          this.data_map_locs = this.cityos.getLocations(data2.id);
        }));
      }
      if (data.location) {
        this.mode = 'location';
        this.active_loc = data.location;
        this.data_loc = this.cityos.getLocation(data.location);
      }
    });
  }

getCenter(map){
  return map.center.coordinates;
}

}
