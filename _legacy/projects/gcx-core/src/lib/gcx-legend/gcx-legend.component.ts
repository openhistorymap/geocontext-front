import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'gcx-legend',
  templateUrl: './gcx-legend.component.html',
  styleUrls: ['./gcx-legend.component.css']
})
export class GcxLegendComponent implements OnInit {

  @Input() style;
  constructor() { }

  ngOnInit() {
  }

}
