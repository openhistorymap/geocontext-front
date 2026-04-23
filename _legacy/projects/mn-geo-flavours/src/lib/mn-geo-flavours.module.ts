import { MnRegistryModule } from '@modalnodes/mn-registry';
import { NgModule } from '@angular/core';
import { MnGeoFlavoursRegistryService } from './mn-geo-flavours-registry.service';

@NgModule({
  imports: [
    MnRegistryModule
  ],
  declarations: [],
  exports: [],
  providers: [MnGeoFlavoursRegistryService]
})
export class MnGeoFlavoursModule { }
