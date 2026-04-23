import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MnGeoDatasourcesRegistryService } from './mn-geo-datasources-registry.service';
import { MnGeoDatasourcesConfRegistryService } from './mn-geo-datasources-conf-registry.service';
import { Datasource } from './datasource';

export interface DatasourceDeclaration {
  name: string;
  type: string;
  conf: any;
}

@Injectable({ providedIn: 'root' })
export class DatasourcesmanagerService {
  private readonly dsreg = inject(MnGeoDatasourcesRegistryService);
  private readonly dscreg = inject(MnGeoDatasourcesConfRegistryService);

  private readonly pending: Datasource[] = [];
  private lmgr: any;

  setLayermanager(lmgr: any): void {
    this.lmgr = lmgr;
  }

  addDatasource(item: DatasourceDeclaration): void {
    const ds = this.dsreg.for(item.type) as Datasource;
    ds.setName(item.name);
    ds.setConf(item.conf);
    this.pending.push(ds);
    this.dscreg.register(item.name, item.conf);
  }

  fetchDatasources(): Observable<unknown[]> {
    if (this.pending.length === 0) {
      return of([]);
    }
    return forkJoin(this.pending.map((ds) => ds.fetchData())).pipe(
      tap((results) => {
        results.forEach((data, i) => {
          this.dsreg.register(this.pending[i].getName(), data);
        });
      })
    );
  }

  getDatasource(name: string): any {
    return this.dsreg.for(name);
  }
}
