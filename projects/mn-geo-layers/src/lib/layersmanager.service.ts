import {
  DatasourcesmanagerService
} from '@modalnodes/mn-geo-datasources';
import {
  Injectable
} from '@angular/core';
import {
  Layer
} from './layer.interface';

@Injectable({
  providedIn: 'root'
})
export class LayersmanagerService {

  lyrs = [];
  flavour: any;
  dsmgr: any;

  setup: Map < any, any > = new Map < any, any > ();

  nayDataSource = [];
  yayDataSource = [];
  constructor() {}

  create(item) {
    const lyr: Layer = item.layer;
    this.lyrs.push(lyr);
    lyr.setConfiguration(item);
    if (lyr.getRequiresDatasources()) {
      lyr.setDatasourceManager(this.dsmgr);
    }
    const flyr = lyr.create();
    return flyr;
  }

  setDatasourcemanager(dsmgr: any) {
    this.dsmgr = dsmgr;
  }

  setFlavour(flavour: any) {
    this.flavour = flavour;
  }

  addLayer(item: any) {
    if (item.layer.getRequiresDatasources()) {
      this.yayDataSource.push(item);
    } else {
      this.nayDataSource.push(item);
    }
  }

  displayLayers() {
    this.nayDataSource.map(x => {
      const lyr = this.create(x);
      this.flavour.addLayer(lyr);
    });
    this.dsmgr.fetchDatasources().subscribe(res => {
        this.yayDataSource.forEach(item => {
          if (item.layer.getRequiresDatasources()) {
            console.log('adding', item);
            this.addLayer(item);
          }
          console.log('done adding layers with datasources');
        });
      });
    }

    getLayers() {
      return this.lyrs;
    }
  }
