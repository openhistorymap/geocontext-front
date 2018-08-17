import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { MnRegistryService, MnMetaRegistryService } from '@modalnodes/mn-registry';
import { Datasource } from './datasource';

@Injectable({
  providedIn: 'root'
})
export class MnGeoDatasourcesRegistryService extends MnRegistryService<any> {

  constructor(
    private meta: MnMetaRegistryService,
    private http: HttpClient,
    private injector: Injector
  ) {
    super();
    this.meta.register('mn-geo-datasets', this);
    this.meta.registerName('mn-geo-datasets', this);
    this.meta.registerTags(['datasets'], this);
  }

  for(name: string): any {
    console.log('mn-geo-datasources', name);
    const f = super.for(name);
    console.log('mn-geo-datasources', f);
    const ds = new f();
    ds.setup({http: this.http});
    return ds;
  }
}
