import { NgModule } from '@angular/core';
import { MnGeoLayersRegistryService } from './mn-geo-layers-registry.service';
import { MnRegistryModule } from '@modalnodes/mn-registry';

@NgModule({
  imports: [
    MnRegistryModule
  ],
  declarations: [],
  exports: [],
  providers: [MnGeoLayersRegistryService]
})
export class MnGeoLayersModule { }
