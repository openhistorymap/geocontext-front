import { EventEmitter } from '@angular/core';
import { DatasourcesmanagerService } from '@modalnodes/mn-geo-datasources';

export interface ILayer {
  getName(): string;
  setName(name: string): void;

  getType(): string;
  getUpdateable(): boolean;
  update(bbox: number[] | { n: number; e: number; s: number; w: number }, zoom: number, confs?: any): any;

  setConfiguration(conf: any): void;
  getConfiguration(): any;

  create(): any;

  getDatasourceManager(): DatasourcesmanagerService;
  getRequiresDatasources(): boolean;

  featureClicked(feat: any): void;
}

export interface ILayerConfigurator {
  setType(type: string): void;
  setUpdateable(b: boolean): void;
  setDatasourceManager(repo: DatasourcesmanagerService): void;
  setRequiresDatasources(b: boolean): void;
  setClickable(ee: EventEmitter<any>): void;
}

export abstract class Layer implements ILayer, ILayerConfigurator {
  private _name = '';
  private _type = '';
  private _conf: any;
  private _updateable = false;
  private _repo!: DatasourcesmanagerService;
  private _requiresDS = false;
  private _ee?: EventEmitter<any>;

  setName(name: string): void {
    this._name = name;
  }
  getName(): string {
    return this._name;
  }

  setConfiguration(conf: any): void {
    this._conf = conf;
  }
  getConfiguration(): any {
    return this._conf;
  }

  getType(): string {
    return this._type;
  }
  setType(type: string): void {
    this._type = type;
  }

  getUpdateable(): boolean {
    return this._updateable;
  }
  setUpdateable(updateable: boolean): void {
    this._updateable = updateable;
  }

  update(_bbox: number[] | { n: number; e: number; s: number; w: number }, _zoom: number, _confs?: any): any {
    if (this._updateable) {
      throw new Error(`Layer "${this._name}" declared updateable, yet no "update" method is defined.`);
    }
  }

  setDatasourceManager(repo: DatasourcesmanagerService): void {
    this._repo = repo;
  }
  getDatasourceManager(): DatasourcesmanagerService {
    return this._repo;
  }

  setRequiresDatasources(b: boolean): void {
    this._requiresDS = b;
  }
  getRequiresDatasources(): boolean {
    return this._requiresDS;
  }

  setClickable(ee: EventEmitter<any>): void {
    this._ee = ee;
  }

  featureClicked(feat: any): void {
    this._ee?.emit(feat);
  }

  abstract create(): any;
}
