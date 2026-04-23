import { Injectable } from '@angular/core';
import { MnRegistryService, MnMetaRegistryService } from '@modalnodes/mn-registry';

@Injectable({
  providedIn: 'root'
})
export class DatasetRegistryService extends MnRegistryService<string> {


  constructor(
    private meta: MnMetaRegistryService
  ) {
    super();
    this.meta.register('_mn-datasets', this);
    this.meta.registerName('_mn-datasets', this);
    this.meta.registerTags(['cache'], this);
  }

}
