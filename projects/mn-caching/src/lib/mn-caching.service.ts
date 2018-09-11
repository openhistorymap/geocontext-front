import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpSentEvent,
  HttpUserEvent
} from '@angular/common/http';
import { of , Observable } from 'rxjs';
import { tap, delay, mapTo, share } from 'rxjs/operators';

export abstract class Cache {
  abstract get(req: HttpRequest < any > ): HttpResponse < any > | null;
  abstract put(req: HttpRequest < any > , res: HttpResponse < any > ): void;
}

export interface CacheEntry {
  url: string;
  response: HttpResponse < any > ;
  entryTime: number;
}

export const MAX_CACHE_AGE = 20000;
export const DELAY = 500;


@Injectable()
export class MnCachingService implements HttpInterceptor {
  active_dls = [];

  constructor(
    private cache: CacheMapService,
    private obs: ObservableMapService
  ) {}

  intercept(req: HttpRequest < any > , next: HttpHandler) {
    if (!this.isRequestCachable(req)) {
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
    return (req.method === 'GET');
  }
}


@Injectable()
export class CacheMapService implements Cache {
  cacheMap = new Map < string, CacheEntry > ();
  get(req: HttpRequest < any > ): HttpResponse < any > | null {
    const entry = this.cacheMap.get(req.urlWithParams);
    if (!entry) {
      return null;
    }
    const isExpired = (Date.now() - entry.entryTime) > MAX_CACHE_AGE;
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
      if ((Date.now() - entry.entryTime) > MAX_CACHE_AGE) {
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
