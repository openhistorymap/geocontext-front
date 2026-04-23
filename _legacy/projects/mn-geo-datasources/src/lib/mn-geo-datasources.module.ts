import { HttpClientModule } from '@angular/common/http';
import { MnGeoDatasourcesRegistryService } from './mn-geo-datasources-registry.service';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    HttpClientModule
  ],
  declarations: [],
  exports: [],
  providers: [MnGeoDatasourcesRegistryService]
})
export class MnGeoDatasourcesModule { }
