import { Component, OnInit, ViewChild } from '@angular/core';
import { DatasourceDirective } from '../datasources/datasource.directive';

@Component({
  selector: 'mn-datasource',
  template: '',
  styleUrls: ['./mn-datasource.component.css']
})
export class MnDatasourceComponent implements OnInit {

  @ViewChild(DatasourceDirective) dirs;
  constructor() { }

  ngOnInit() {
    console.log('DataSources', this.dirs);
  }

}
