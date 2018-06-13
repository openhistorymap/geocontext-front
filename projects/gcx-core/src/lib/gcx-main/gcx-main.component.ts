import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'gcx-main',
  templateUrl: './gcx-main.component.html',
  styleUrls: ['./gcx-main.component.css']
})
export class GcxMainComponent implements OnInit {

  center = 1;
  startzoom = 1;
  minzoom = 1;
  maxzoom = 1;
  layers = 1;

  constructor() { }

  ngOnInit() {
  }

}
