import { GcxCoreModule } from '@geocontext/gcx-core';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    GcxCoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
