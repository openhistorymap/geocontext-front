import { HTTP_INTERCEPTORS, HttpRequest } from '@angular/common/http';
import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';

import { CacheMapService, MnCachingService, ObservableMapService } from './mn-caching.service';

export interface MnCachingConfiguration {
  ignorePaths?: string[];
  cacheMethods?: string[];
  invalidationFunction?: (x: HttpRequest<any>) => { };
  maxCacheAge?: number;
}

export const MnCachingServiceConfiguration = new InjectionToken < MnCachingConfiguration > ('MnCachingConfiguration');

@NgModule()
export class MnCachingModule {
  static forRoot(config: MnCachingConfiguration = {
    ignorePaths: [],
    cacheMethods: ['GET', 'OPTIONS'],
    maxCacheAge: 20000
  }): ModuleWithProviders {
    return {
      ngModule: MnCachingModule,
      providers: [
        CacheMapService,
        ObservableMapService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: MnCachingService,
          multi: true
        },
        {
          provide: MnCachingServiceConfiguration,
          useValue: config
        }
      ]
    };
  }
}
