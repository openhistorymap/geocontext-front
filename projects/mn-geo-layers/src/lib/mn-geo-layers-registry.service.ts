import { Injectable, inject } from '@angular/core';
import { MnRegistryService, MnMetaRegistryService } from '@openhistorymap/mn-registry';
import { Layer } from './layer.interface';

@Injectable({ providedIn: 'root' })
export class MnGeoLayersRegistryService extends MnRegistryService<new () => Layer> {
  private readonly meta = inject(MnMetaRegistryService);

  constructor() {
    super();
    this.meta.register('mn-geo-layers', this);
    this.meta.registerName('mn-geo-layers', this);
    this.meta.registerTags(['layers'], this);
  }

  override for(name: string): any {
    const ctor = super.for(name);
    return new ctor();
  }
}
