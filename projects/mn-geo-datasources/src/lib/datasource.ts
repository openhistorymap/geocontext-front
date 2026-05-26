import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface IDatasource {
  getName(): string;
  getConf(): any;

  /**
   * Names of OTHER datasources whose data must be available before
   * `fetchData()` can run. Plain (HTTP, inline) datasources return
   * `[]`; derived datasources (e.g. `transform`) declare the parent
   * names they need so `DatasourcesmanagerService.fetchDatasources()`
   * can resolve in dependency-order waves.
   */
  getDependencies(): string[];

  fetchData(): Observable<any>;
  prepareData(data: any): any;
  getData(): any;

  isReady(): boolean;
}

export interface IDatasourceSetter {
  setName(name: string): void;
  setConf(conf: any): void;
  setup(setup: Record<string, unknown>): void;
}

export abstract class Datasource implements IDatasource, IDatasourceSetter {
  protected _ready = false;
  protected _name = '';
  protected _conf: any = {};
  protected _data: any;

  getName(): string {
    return this._name;
  }
  setName(name: string): void {
    this._name = name;
  }

  getConf(): any {
    return this._conf;
  }
  setConf(conf: any): void {
    this._conf = conf;
  }

  /** Default: no dependencies. Override on derived datasources. */
  getDependencies(): string[] {
    return [];
  }

  fetchData(): Observable<any> {
    this._data = this.prepareData(this._data);
    this._ready = true;
    return of(this._data);
  }

  abstract prepareData(data: any): any;

  getData(): any {
    return this._data;
  }

  isReady(): boolean {
    return this._ready;
  }

  setup(_setup: Record<string, unknown>): void {
    // subclasses override
  }
}

@Injectable()
export abstract class RemoteHttpDatasource extends Datasource {
  protected http: HttpClient | null = null;

  override setup(setup: Record<string, unknown>): void {
    for (const [k, v] of Object.entries(setup ?? {})) {
      (this as any)[k] = v;
    }
  }

  override fetchData(): Observable<any> {
    if (!this.http) {
      throw new Error('RemoteHttpDatasource: HttpClient not injected — did the registry call setup({http})?');
    }
    return this.http.get(this._conf.source).pipe(
      tap((data) => {
        this._data = this.prepareData(data);
        this._ready = true;
      })
    );
  }

  abstract override prepareData(data: any): any;
}
