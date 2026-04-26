import { Injectable, inject } from '@angular/core';
import { MnRegistryService, MnMetaRegistryService } from '@openhistorymap/mn-registry';

@Injectable({ providedIn: 'root' })
export class MnGeoDatasourcesConfRegistryService extends MnRegistryService<any> {
  private readonly meta = inject(MnMetaRegistryService);

  constructor() {
    super();
    this.meta.register('mn-geo-datasets-conf', this);
    this.meta.registerName('mn-geo-datasets-conf', this);
    this.meta.registerTags(['datasets-conf', 'conf'], this);
  }
}
