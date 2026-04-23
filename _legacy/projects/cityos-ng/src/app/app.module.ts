import { MatButtonModule } from '@angular/material/button';
import { CityosCoverComponent } from './cityos-cover/cityos-cover.component';
import { CityosComponent } from './cityos/cityos.component';
import { AppRouterModule } from './app.router.module';
import { MnGeoLayersOsmModule } from '@modalnodes/mn-geo-layers-osm';
import { MnGeoLayersModule } from '@modalnodes/mn-geo-layers';
import { MnMapModule } from '@modalnodes/mn-map';
import { MnGeoModule } from '@modalnodes/mn-geo';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import { InViewportModule, WindowRef } from '@thisissoon/angular-inviewport';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth'

import { AppComponent } from './app.component';
import { CityosSidebarComponent } from './components/cityos-sidebar/cityos-sidebar.component';
import { CityosMainComponent } from './components/cityos-main/cityos-main.component';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { MatIconModule } from '@angular/material/icon';

const fbenv = {
  apiKey: 'AIzaSyBdEQF-ju91a02SBTjDcQ8-MZK832KOJzQ',
  authDomain: 'macro-incline-826.firebaseapp.com',
  databaseURL: 'https://macro-incline-826.firebaseio.com',
  projectId: 'macro-incline-826',
  storageBucket: 'macro-incline-826.appspot.com',
  messagingSenderId: '13698151013'
};
const providers = [{ provide: WindowRef, useFactory: () => window }];

@NgModule({
  declarations: [
    AppComponent,
    CityosSidebarComponent,
    CityosMainComponent,
    CityosComponent,
    CityosCoverComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatGridListModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    // FlexLayoutModule,
    InViewportModule.forRoot(providers),

    RouterModule,

    AppRouterModule,

    MnGeoModule,
    MnMapModule,
    MnGeoLayersModule,
    MnGeoLayersOsmModule,

    AngularFireModule.initializeApp(fbenv),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
