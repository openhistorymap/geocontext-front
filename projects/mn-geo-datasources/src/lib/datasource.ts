import { HttpClient, HttpHandler, HttpClientModule } from '@angular/common/http';
import { Injectable, Injector, ReflectiveInjector, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

export interface IDatasource {
    getName(): string;
    getConf(): any;

    fetchData(): any| Observable<any>;
    prepareData(data: any): any;
    getData(): any;

    isReady(): boolean;
}

export interface IDatasourceSetter {
    setName(name: string);
    setConf(conf: any);
    setup(setup: any);
}

export abstract class Datasource implements IDatasource, IDatasourceSetter {
    protected _ready = false;
    protected _name: string;
    protected _conf: any;
    protected _data: any;

    getName() {
        return this._name;
    }

    setName(name: string) {
        this._name = name;
    }


    getConf() {
        return this._conf;
    }

    setConf(conf: any) {
        this._conf = conf;
    }

    fetchData(): any {
        this._data = this.prepareData(this._data);
        this._ready = true;
    }

    abstract prepareData(data: any): any;

    getData() {
        return this._data;
    }

    isReady() {
        return this._ready;
    }

    setup(setup: any) {}

}

@Injectable()
export abstract class RemoteHttpDatasource extends Datasource {
    private http: HttpClient;

    setup(setup: any) {
        for (const k in Object.keys(setup)) {
            if (setup.hasOwnProperty(Object.keys(setup)[k])) {
                this[Object.keys(setup)[k]] = setup[Object.keys(setup)[k]];
            }
        }
    }

    fetchData(): Observable<any> {
        return this.http.get(this._conf.source).pipe(tap(data => {
            this._data = this.prepareData(data);
            this._ready = true;
        }));
    }

    abstract prepareData(data: any): any;
}
