import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideMnGeoLayersOsm } from '@openhistorymap/mn-geo-layers-osm';
import { provideMnGeoLayersOfm } from '@openhistorymap/mn-geo-layers-ofm';
import { provideMnGeoLayersGeomqtt } from '@openhistorymap/mn-geo-layers-geomqtt';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideMnGeoLayersOsm(),
    provideMnGeoLayersOfm(),
    provideMnGeoLayersGeomqtt(),
  ],
};
