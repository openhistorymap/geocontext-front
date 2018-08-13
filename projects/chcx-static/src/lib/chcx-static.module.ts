import { ChcxConfiguratorService } from './chcx-configurator.service';
import { NgModule } from '@angular/core';
import { MnConfiguratorModule, MnConfigurationRegsitryService } from '@modalnodes/mn-configurator';
import { ChcxStaticpageComponent } from './chcx-staticpage/chcx-staticpage.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [];

@NgModule({
  imports: [
    MnConfiguratorModule,
    RouterModule.forChild(routes)
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
