import { Component, OnInit, ViewChild, Input } from '@angular/core';

@Component({
  selector: 'mn-datasource',
  template: '',
  styleUrls: ['./mn-datasource.component.css']
})
export class MnDatasourceComponent implements OnInit {
  @Input() type;
  @Input() name;
  @Input() conf;

  constructor() { }

  ngOnInit() { }

}
