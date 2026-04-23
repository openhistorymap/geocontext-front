
import { Injectable } from '@angular/core';
import { MnRegistryService, MnMetaRegistryService } from '@modalnodes/mn-registry';

@Injectable({
  providedIn: 'root'
})
export class MnGeoModesRegistryService extends MnRegistryService<any> {

  constructor(
    private meta: MnMetaRegistryService
  ) {
    super();
    this.meta.register('mn-geo-modes', this);
    this.meta.registerName('mn-geo-modes', this);
    this.meta.registerTags(['geo-modes'], this);
  }

  for(name: string): any {
    const f = super.for(name);
    return new f();
  }
}
