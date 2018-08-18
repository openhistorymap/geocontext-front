import { GcxLegendComponent } from './gcx-legend/gcx-legend.component';
import { MnConfiguratorModule, MnConfigurationRegsitryService } from '@modalnodes/mn-configurator';
import { GcxCoreService, GCX_CORE_FILE } from './gcx-core.service';
import { GcxMapComponent } from './gcx-map/gcx-map.component';
import { GcxRouterModule } from './gcx-core.router.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MnMapglModule} from '@modalnodes/mn-mapgl';
import { MnMapModule } from '@modalnodes/mn-map';

import { MnGeoModule } from '@modalnodes/mn-geo';
import { MnGeoLayersModule } from '@modalnodes/mn-geo-layers';
import { MnGeoLayersOsmModule } from '@modalnodes/mn-geo-layers-osm';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { GcxMainComponent } from './gcx-main/gcx-main.component';
import { MnGeoLayersStamenModule } from '@modalnodes/mn-geo-layers-stamen';
import { RouterModule } from '@angular/router';



@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    GcxRouterModule,

    MnConfiguratorModule,
    MnGeoModule,
    MnMapglModule,
    MnMapModule,

    MnGeoLayersModule,
    MnGeoLayersOsmModule,
    MnGeoLayersStamenModule,

    BrowserAnimationsModule,

    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatTreeModule,
    MatListModule,
    MatTabsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
  ],
  declarations: [GcxMainComponent, GcxMapComponent, GcxLegendComponent],
  exports: [GcxMainComponent, GcxMapComponent, GcxLegendComponent],
  providers: [GcxCoreService]
})
export class GcxCoreModule {
  constructor(
    private conf: MnConfigurationRegsitryService
  ) {
    this.conf.register('gcx-core', GCX_CORE_FILE);
  }
}
