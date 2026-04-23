import { MnRegistryModule } from '@modalnodes/mn-registry';
import { MnGeoModesRegistryService } from './mn-geo-modes-registry.service';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    MnRegistryModule
  ],
  declarations: [],
  exports: [],
  providers: [MnGeoModesRegistryService]
})
export class MnGeoModesModule { }
