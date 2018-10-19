import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mn-cartouche',
  templateUrl: './cartouche.component.html',
  styleUrls: ['./cartouche.component.css']
})
export class CartoucheComponent implements OnInit {

  @Input() item;
  @Input() properties;
  @Input() conf;

  constructor() { }

  ngOnInit() {

  }

  private cols(tag) {
    const ret = [];
    for (const c of this.conf) {
      if (c.tags.indexOf(tag) >= 0) {
        ret.push(c.column);
      }
    }
    return ret;
  }

  items(tag, concat? , remove?) {
    const ret = [];
    const c = this.cols(tag);
    c.map(v => {
      ret.push(this.properties[v]);
    });
    if (concat) {
      return ret.join(concat);
    }
    return ret;
  }

  getKeys(dict) {
    return Object.keys(dict);
  }

}
