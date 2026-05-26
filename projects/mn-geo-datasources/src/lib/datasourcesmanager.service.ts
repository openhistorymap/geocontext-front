import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
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

  private pending: Datasource[] = [];
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

  /**
   * Resolve pending datasources in dependency-order waves. A plain
   * (HTTP / inline) datasource has `getDependencies() === []` and is
   * eligible in the first wave; derived datasources (e.g. `transform`,
   * with `conf.from = '<parent>'`) wait until their parent has been
   * resolved and its data registered, then run in a subsequent wave.
   * Each wave runs in parallel via forkJoin; waves repeat until no
   * pending remain. An unresolvable dependency throws — better to
   * fail loudly than to render a half-empty map.
   */
  fetchDatasources(): Observable<unknown[]> {
    if (this.pending.length === 0) {
      return of([]);
    }
    const resolved = new Set<string>();
    const allResults: unknown[] = [];

    const runWave = (): Observable<unknown[]> => {
      const ready: Datasource[] = [];
      const blocked: Datasource[] = [];
      for (const ds of this.pending) {
        const deps = ds.getDependencies?.() ?? [];
        if (deps.every((d) => resolved.has(d))) ready.push(ds);
        else blocked.push(ds);
      }
      if (ready.length === 0) {
        if (blocked.length > 0) {
          const names = blocked
            .map((d) => `${d.getName()} ← ${(d.getDependencies?.() ?? []).join(', ')}`)
            .join('; ');
          throw new Error(
            `DatasourcesmanagerService: unresolvable datasource dependencies for [${names}]`,
          );
        }
        return of(allResults);
      }
      return forkJoin(ready.map((ds) => ds.fetchData())).pipe(
        tap((results) => {
          results.forEach((data, i) => {
            const name = ready[i].getName();
            this.dsreg.register(name, data);
            resolved.add(name);
            allResults.push(data);
          });
          this.pending = blocked;
        }),
        switchMap(() => runWave()),
      );
    };

    return runWave();
  }

  getDatasource(name: string): any {
    return this.dsreg.for(name);
  }
}
