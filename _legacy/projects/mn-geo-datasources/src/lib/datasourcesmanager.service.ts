import { filter, tap } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { MnGeoDatasourcesRegistryService } from './mn-geo-datasources-registry.service';
import { Datasource } from './datasource';

import { DataModel } from 'datamodel';
import { MnGeoDatasourcesConfRegistryService } from './mn-geo-datasources-conf-registry.service';

@Injectable({
  providedIn: 'root'
})
export class DatasourcesmanagerService {

  ds_temp = [];
  lmgr: any;

  constructor(
    private dsreg: MnGeoDatasourcesRegistryService,
    private dscreg: MnGeoDatasourcesConfRegistryService
  ) { }

  setLayermanager(lmgr: any) {
    this.lmgr = lmgr;
  }

  addDatasource(item) {
    const dd = this.dsreg.for(item.type);
    const da = dd as Datasource;
    console.log('datasource', da);
    da.setName(item.name);
    da.setConf(item.conf);
    this.ds_temp.push(da);
    this.dscreg.register(item.name, item.conf);
  }

  fetchDatasources(): Observable<any> {
    return forkJoin(...this.ds_temp.map((x: Datasource) => {
      return x.fetchData();
    })).pipe(
      tap((r) => {
        r.map((o, j) => {
          this.dsreg.register(this.ds_temp[j].getName(), o);
        });
      })
    );
  }

  getDatasource(dsName) {
    return this.dsreg.for(dsName);
  }

}
