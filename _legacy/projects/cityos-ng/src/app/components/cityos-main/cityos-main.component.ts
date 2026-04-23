import { Observable } from 'rxjs';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CityosService } from '../../cityos.service';

@Component({
  selector: 'cos-main',
  templateUrl: './cityos-main.component.html',
  styleUrls: ['./cityos-main.component.css']
})
export class CityosMainComponent implements OnInit, OnChanges {

  @Input() public center;
  @Input() public minzoom;
  @Input() public maxzoom;
  @Input() public startzoom;


  @Input() fbitems: Observable<any[]> = new Observable();

  dataset = {type: 'FeatureCollection', features: []};

  constructor(
    private cityos: CityosService
  ) { }

  ngOnInit() {

  }

  toProps(v) {
    const ret = {};
    v.attributes.forEach(x => {
      if (!ret.hasOwnProperty(x.name)) {
        ret[x.name] = [];
      }
      ret[x.name].push(x.value);
    });
    return ret;
  }


  ngOnChanges(changes) {
    if (changes['fbitems'] && this.fbitems) {
      this.fbitems.subscribe(data => {
        this.dataset = {type: 'FeatureCollection', features: []};
        data.forEach(v => {
          this.dataset.features.push({type: 'Feature', geometry: v.point, properties: this.toProps(v)});
        });
      });
    }
}

}
