import { HttpClientModule } from '@angular/common/http';
import { ChcxConfiguratorService } from './chcx-configurator.service';
import { NgModule } from '@angular/core';
import { MnConfiguratorModule, MnConfigurationRegsitryService } from '@modalnodes/mn-configurator';
import { ChcxStaticpageComponent } from './chcx-staticpage/chcx-staticpage.component';
import { RouterModule } from '@angular/router';
import { ChcxRouterModule } from './chcx-static.router.module';


@NgModule({
  imports: [
    MnConfiguratorModule,
    RouterModule,
    HttpClientModule,
    ChcxRouterModule
  ],
  declarations: [ChcxStaticpageComponent],
  exports: [ChcxStaticpageComponent],
  providers: [ChcxConfiguratorService]
})
export class ChcxStaticModule {
  constructor(
    private conf: MnConfigurationRegsitryService
  ) {
    this.conf.register('chcx-static', '/assets/chcx-static.json');
  }
}
