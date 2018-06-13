import { Component, OnInit, ViewChildren } from '@angular/core';
import { DatasourceDirective } from '../datasources/datasource.directive';

@Component({
  selector: 'mn-datasource',
  templateUrl: './mn-datasource.component.html',
  styleUrls: ['./mn-datasource.component.css']
})
export class MnDatasourceComponent implements OnInit {

  @ViewChildren(DatasourceDirective) dirs;
  constructor() { }

  ngOnInit() {
    console.log(this.dirs.first);
  }

}
