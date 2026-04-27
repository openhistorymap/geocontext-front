import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideMnGeoLayersFeature,
} from '@openhistorymap/mn-geo-layers';
import { provideMnGeoDatasourcesGeojson } from '@openhistorymap/mn-geo-datasources';
import { provideMnGeoDatasourcesCsv } from '@openhistorymap/mn-geo-datasources-csv';
import { provideMnGeoLayersOsm } from '@openhistorymap/mn-geo-layers-osm';
import { provideMnGeoLayersOfm } from '@openhistorymap/mn-geo-layers-ofm';
import { provideMnGeoLayersGeomqtt } from '@openhistorymap/mn-geo-layers-geomqtt';
import { provideMnGeoLayersCarto } from '@openhistorymap/mn-geo-layers-carto';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    // Default GeoJSON renderer + datasources.
    provideMnGeoLayersFeature(),
    provideMnGeoDatasourcesGeojson(),
    provideMnGeoDatasourcesCsv(),
    // Tile sources.
    provideMnGeoLayersOsm(),
    provideMnGeoLayersOfm(),
    provideMnGeoLayersCarto(),
    // Live data streams.
    provideMnGeoLayersGeomqtt(),
  ],
};
