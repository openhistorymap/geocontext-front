import { Injectable } from '@angular/core';
import { MnRegistryService, MnMetaRegistryService } from '@modalnodes/mn-registry';

@Injectable({
  providedIn: 'root'
})
export class MnGeoFlavoursRegistryService extends MnRegistryService<any> {

  constructor(
    private meta: MnMetaRegistryService
  ) {
    super();
    this.meta.register('mn-geo-flavours', this);
    this.meta.registerName('mn-geo-flavours', this);
    this.meta.registerTags(['geo-flavours'], this);
  }

  for(name: string): any {
    const f = super.for(name);
    return new f();
  }
}
