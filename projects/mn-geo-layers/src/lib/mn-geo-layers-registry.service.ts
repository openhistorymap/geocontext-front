import { Injectable } from '@angular/core';
import { MnRegistryService, MnMetaRegistryService } from '@modalnodes/mn-registry';

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
}
