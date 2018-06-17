import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'gcx-main',
  templateUrl: './gcx-main.component.html',
  styleUrls: ['./gcx-main.component.css']
})
export class GcxMainComponent implements OnInit {

  @Input() data: any;

  @Input() center = 1;
  @Input() startzoom = 1;
  @Input() minzoom = 1;
  @Input() maxzoom = 1;
  @Input() layers = 1;

  constructor() { }

  ngOnInit() {
  }

}
