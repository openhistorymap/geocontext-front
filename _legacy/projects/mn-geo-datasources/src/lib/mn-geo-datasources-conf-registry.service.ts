import { HttpClient } from '@angular/common/http';
import { MnRegistryService, MnMetaRegistryService } from '@modalnodes/mn-registry';
import { Injectable, Injector } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MnGeoDatasourcesConfRegistryService extends MnRegistryService<any> {

  constructor(
    private meta: MnMetaRegistryService,
    private http: HttpClient,
    private injector: Injector
  ) {
    super();
    this.meta.register('mn-geo-datasets-conf', this);
    this.meta.registerName('mn-geo-datasets-conf', this);
    this.meta.registerTags(['datasets-conf', 'conf'], this);
  }

  for(name: string): any {
    const f = super.for(name);
    const ds = new f();
    ds.setup({http: this.http});
    return ds;
  }
}
