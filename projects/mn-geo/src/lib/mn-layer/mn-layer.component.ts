import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mn-layer',
  templateUrl: './mn-layer.component.html',
  styleUrls: ['./mn-layer.component.css']
})
export class MnLayerComponent implements OnInit {

  @Input() name = "";

  constructor() { }

  ngOnInit() {
  }

}
