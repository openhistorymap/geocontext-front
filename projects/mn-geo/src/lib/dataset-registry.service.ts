import { Injectable, inject } from '@angular/core';
import { MnRegistryService, MnMetaRegistryService } from '@modalnodes/mn-registry';

/**
 * Workspace-local cache registry for resolved datasets. Flavour/layer code
 * can look up prepared data by name without re-fetching.
 */
@Injectable({ providedIn: 'root' })
export class DatasetRegistryService extends MnRegistryService<unknown> {
  private readonly meta = inject(MnMetaRegistryService);

  constructor() {
    super();
    this.meta.register('_mn-datasets', this);
    this.meta.registerName('_mn-datasets', this);
    this.meta.registerTags(['cache'], this);
  }
}
