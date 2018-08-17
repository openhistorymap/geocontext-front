import { GcxCoreModule } from '@geocontext/gcx-core';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MnGeoModule } from '@modalnodes/mn-geo';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    GcxCoreModule,
    MnGeoModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
