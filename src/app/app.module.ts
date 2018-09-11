import { ChcxStaticModule } from '@ohmap/chcx-static';
import { GcxCoreModule } from '@geocontext/gcx-core';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MnGeoModule } from '@modalnodes/mn-geo';
import { CityosSidebarComponent } from './cityos-sidebar/cityos-sidebar.component';


@NgModule({
  declarations: [
    AppComponent,
    CityosSidebarComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    GcxCoreModule,
    ChcxStaticModule
    ,
    MnGeoModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
