import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  data: any = {};

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.http.get('/assets/data.json').subscribe(data => {
      this.data = data;
    });
  }

}
