import { MnCachingServiceConfiguration, MnCachingConfiguration } from './mn-caching.module';
import { HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { share, tap } from 'rxjs/operators';

export abstract class Cache {
  abstract get(req: HttpRequest < any > ): HttpResponse < any > | null;
  abstract put(req: HttpRequest < any > , res: HttpResponse < any > ): void;
}

export interface CacheEntry {
  url: string;
  response: HttpResponse < any > ;
  entryTime: number;
}


@Injectable()
export class MnCachingService implements HttpInterceptor {
  active_dls = [];

  constructor(
    private cache: CacheMapService,
    private obs: ObservableMapService,
    @Inject(MnCachingServiceConfiguration) private config: MnCachingConfiguration
  ) {}

  intercept(req: HttpRequest < any > , next: HttpHandler) {
    if (!this.isRequestCachable(req)) {
      if (this.config.invalidationFunction) {
        this.config.invalidationFunction(req);
      }
      return next.handle(req);
    }
    const cachedResponse = this.cache.get(req);
    if (cachedResponse !== null) {
      return of(cachedResponse);
    }
    let c_able = null;
    if (this.active_dls.indexOf(req.urlWithParams) < 0) {
      console.log('new call', req.urlWithParams);
      this.active_dls.push(req.urlWithParams);
      c_able = next.handle(req).pipe(
        share(),
        tap(event => {
          if (event instanceof HttpResponse) {
            this.cache.put(req, event);
            this.active_dls.splice(this.active_dls.indexOf(req.urlWithParams), 1);
          }
        })
      );
      this.obs.put(req, c_able);
      return c_able;
    } else {
      console.log('found call', req.urlWithParams);
      return this.obs.get(req);
    }
  }

  private isRequestCachable(req: HttpRequest < any > ) {
    return (this.config.cacheMethods.indexOf(req.method) >= 0);
  }
}


@Injectable()
export class CacheMapService implements Cache {
  constructor(
    @Inject(MnCachingServiceConfiguration) private config
  ) { }
  cacheMap = new Map < string, CacheEntry > ();
  get(req: HttpRequest < any > ): HttpResponse < any > | null {
    const entry = this.cacheMap.get(req.urlWithParams);
    if (!entry) {
      return null;
    }
    const isExpired = (Date.now() - entry.entryTime) > this.config.maxCacheAge;
    return isExpired ? null : entry.response;
  }
  put(req: HttpRequest < any > , res: HttpResponse < any > ): void {
    const entry: CacheEntry = {
      url: req.urlWithParams,
      response: res,
      entryTime: Date.now()
    };
    this.cacheMap.set(req.urlWithParams, entry);
    this.deleteExpiredCache();
  }
  private deleteExpiredCache() {
    this.cacheMap.forEach(entry => {
      if ((Date.now() - entry.entryTime) > this.config.maxCacheAge) {
        this.cacheMap.delete(entry.url);
      }
    });
  }
  public clearCache() {
    this.cacheMap.clear();
  }
}


@Injectable()
export class ObservableMapService {
  constructor(
    @Inject(MnCachingServiceConfiguration) private config
  ) { }
  cacheMap = new Map < string, Observable<any> > ();
  get(req: HttpRequest < any > ): Observable<any> | null {
    const entry = this.cacheMap.get(req.urlWithParams);
    if (!entry) {
      return null;
    }
    return entry;
  }
  put(req: HttpRequest < any > , res: Observable<any> ): void {
    this.cacheMap.set(req.urlWithParams, res);
  }
}
