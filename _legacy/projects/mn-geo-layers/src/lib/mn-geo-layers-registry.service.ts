import { Injectable } from '@angular/core';
import { MnRegistryService, MnMetaRegistryService } from '@modalnodes/mn-registry';
import { Layer } from './layer.interface';

@Injectable({
  providedIn: 'root'
})
export class MnGeoLayersRegistryService extends MnRegistryService<any> {

  constructor(
    private meta: MnMetaRegistryService
  ) {
    super();
    this.meta.register('mn-geo-layers', this);
    this.meta.registerName('mn-geo-layers', this);
    this.meta.registerTags(['layers'], this);
  }

  for(name: string): any {
    const f = super.for(name);
    return new f();
  }
}
