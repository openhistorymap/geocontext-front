import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MnDockerModule } from '@modalnodes/mn-docker';
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


import { GcxMainComponent } from './gcx-main/gcx-main.component';
import { MnGeoLayersStamenModule } from '@modalnodes/mn-geo-layers-stamen';

@NgModule({
  imports: [
    CommonModule,
    // MnDockerModule,
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
    
  ],
  declarations: [GcxMainComponent],
  exports: [GcxMainComponent]
})
export class GcxCoreModule { }
