import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mn-map mn-style',
  template: '',
  styleUrls: ['./mn-style.component.css']
})
export class MnStyleComponent implements OnInit {

  @Input() style;
  constructor() { }

  ngOnInit() {
  }

}
