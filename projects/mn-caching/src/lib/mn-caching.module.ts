import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CacheMapService, ObservableMapService, MnCachingService } from './mn-caching.service';

@NgModule({
  providers: [
    CacheMapService,
    ObservableMapService,
    {provide: HTTP_INTERCEPTORS, useClass: MnCachingService, multi: true},
  ]
})
export class MnCachingModule { }
