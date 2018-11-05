import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { MnConfigurationRegsitryService, MnConfiguratorModule } from '@modalnodes/mn-configurator';
import { MnGeoModule } from '@modalnodes/mn-geo';
import { MnGeoDatasourcesCsvModule } from '@modalnodes/mn-geo-datasources-csv';
import { MnGeoLayersModule } from '@modalnodes/mn-geo-layers';
import { MnGeoLayersOsmModule } from '@modalnodes/mn-geo-layers-osm';
import { MnGeoLayersStamenModule } from '@modalnodes/mn-geo-layers-stamen';
import { MnMapModule } from '@modalnodes/mn-map';
import { MnMapglModule } from '@modalnodes/mn-mapgl';

import { GcxRouterModule } from './gcx-core.router.module';
import { GCX_CORE_FILE, GcxCoreService } from './gcx-core.service';
import { GcxLegendComponent } from './gcx-legend/gcx-legend.component';
import { GcxMainComponent } from './gcx-main/gcx-main.component';
import { GcxMapComponent } from './gcx-map/gcx-map.component';



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

    MnGeoDatasourcesCsvModule,

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
    MatExpansionModule,
    MatInputModule,


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
