import { DatasourcesmanagerService } from '@modalnodes/mn-geo-datasources';
import { EventEmitter } from '@angular/core';
import { MnRegistryService } from '@modalnodes/mn-registry';

export interface ILayer {
    getName(): string;
    setName(name: string);

    getType(): string;
    getUpdateable(): boolean;
    update(bbox: number[]|{n, e, s, w}, zoom: number, confs?: any): any;

    setConfiguration(conf: any);
    getConfiguration(): any;

    create(): any;

    getDatasourceManager(): DatasourcesmanagerService;
    getRequiresDatasources(): boolean;

    featureClicked(feat: any);
}

export interface ILayerConfigurator {
    setType(type: string);
    setUpdateable(b: boolean);
    setDatasourceManager(repo: any);
    setRequiresDatasources(b: boolean);
    setClickable(ee: EventEmitter<any>);
}

export abstract class Layer implements ILayer, ILayerConfigurator {
    private _name: string;
    private _type: string;
    private _conf: any;
    private _updateable = false;


    private _repo: DatasourcesmanagerService;
    private _requiresDS: boolean;

    private _ee: EventEmitter<any>;

    setName(name: string) {
        this._name = name;
    }
    getName() {
        return this._name;
    }

    setConfiguration(conf: any) {
        this._conf = conf;
    }
    getConfiguration(): any {
        return this._conf;
    }

    getType() {
        return this._type;
    }

    setType(type: string) {
        this._type = type;
    }

    getUpdateable() {
      return this._updateable;
    }

    setUpdateable(updateable: boolean) {
      this._updateable = updateable;
    }

    update(bbox: number[], zoom: number, confs?: any) {
      if (this._updateable) {
        throw new Error('Layer declared updateable, yet no "update" method is defined!');
      }
    }

    setDatasourceManager(repo: any) {
        this._repo = repo;
    }
    getDatasourceManager(): DatasourcesmanagerService {
        return this._repo;
    }

    setRequiresDatasources(b: boolean) {
        this._requiresDS = b;
    }
    getRequiresDatasources(): boolean {
        return this._requiresDS;
    }

    setClickable(ee: EventEmitter<any>) {
        this._ee = ee;
    }

    featureClicked(feat) {
        this._ee.emit(feat);
    }

    abstract create(): any;
}
