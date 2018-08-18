import { HttpClient } from '@angular/common/http';
import { ChcxConfiguratorService } from './../chcx-configurator.service';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-chcx-staticpage',
  templateUrl: './chcx-staticpage.component.html',
  styleUrls: ['./chcx-staticpage.component.css']
})
export class ChcxStaticpageComponent implements OnInit {

  @Input() routeContent;
  inner;

  constructor(
    private route: ActivatedRoute,
    private conf: ChcxConfiguratorService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.routeContent = this.conf.getRouteContent(params.name);
      switch (this.routeContent.mode) {
        case 'file':
          this.http.get(this.routeContent.content, { responseType: 'text' }).subscribe(data => {
            this.inner = data;
          });
          break;
        case 'raw':
          this.inner = this.routeContent.content;
          break;
        default:
          break;
      }
    });
  }

}
