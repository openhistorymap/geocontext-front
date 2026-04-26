import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MnRegistryService, MnMetaRegistryService } from '@openhistorymap/mn-registry';
import { Datasource } from './datasource';

@Injectable({ providedIn: 'root' })
export class MnGeoDatasourcesRegistryService extends MnRegistryService<any> {
  private readonly meta = inject(MnMetaRegistryService);
  private readonly http = inject(HttpClient);

  constructor() {
    super();
    this.meta.register('mn-geo-datasets', this);
    this.meta.registerName('mn-geo-datasets', this);
    this.meta.registerTags(['datasets'], this);
  }

  /**
   * If the registered entry is a Datasource class, instantiate and wire HTTP.
   * If it's already resolved data, pass it through.
   */
  override for(name: string): any {
    const entry = super.for(name);
    if (typeof entry === 'function') {
      const ds = new (entry as new () => Datasource)();
      ds.setup({ http: this.http });
      return ds;
    }
    return entry;
  }
}
