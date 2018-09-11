import { Component, OnInit, Input } from '@angular/core';
import { CityosService } from '../../cityos.service';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'cos-sidebar',
  templateUrl: './cityos-sidebar.component.html',
  styleUrls: ['./cityos-sidebar.component.css']
})
export class CityosSidebarComponent implements OnInit {

  @Input() mode = 'global';
  @Input() map;
  @Input() items;

  constructor(
    private cityos: CityosService,
    private storage: AngularFireStorage
  ) { }

  ngOnInit() {
  }


  getFBUrl(file) {
    if (file) {
      const fname_parts = file.split('/');
      const fname = fname_parts[fname_parts.length - 1];
      const ffname = 'media/' + fname;
      const ref = this.storage.ref(ffname);
      console.log(ref);
      return ref.getDownloadURL();
    } else {
      return '';
    }
  }
}
