
export interface ILayer {
    getName(): string;
    setName(name: string);

    setConfiguration(conf: any);
    getConfiguration(): any;

    getType(): string;

    create(): any;
}

export interface ILayerConfigurator {
    setType(type: string);
}

export abstract class Layer implements ILayer, ILayerConfigurator {
    _name: string;
    _type: string;
    _conf: any;

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

    abstract create(): any;
}
