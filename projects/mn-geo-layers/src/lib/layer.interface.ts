import { MnRegistryService } from '@modalnodes/mn-registry';

export interface ILayer {
    getName(): string;
    setName(name: string);
    
    getType(): string;

    setConfiguration(conf: any);
    getConfiguration(): any;

    create(): any;

    getDatasourceRepo(): MnRegistryService<any>;
    getRequiresDatasources(): boolean;
}

export interface ILayerConfigurator {
    setType(type: string);
    setDatasourceRepo(repo: any);
    setRequiresDatasources(b: boolean);
}

export abstract class Layer implements ILayer, ILayerConfigurator {
    private _name: string;
    private _type: string;
    private _conf: any;


    private _repo: MnRegistryService<any>;
    private _requiresDS: boolean;

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

    setDatasourceRepo(repo: MnRegistryService<any>) {
        this._repo = repo;
    }
    getDatasourceRepo(): MnRegistryService<any> {
        return this._repo;
    }

    setRequiresDatasources(b: boolean) {
        this._requiresDS = b;
    }
    getRequiresDatasources(): boolean {
        return this._requiresDS;
    }

    abstract create(): any;
}
