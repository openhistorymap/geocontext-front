import { Layer } from '@modalnodes/mn-geo-layers';
import * as L from 'leaflet';

export class C3DLayer extends Layer {
    c3dBasePath = 'https://api.3dmodelcommons.com';

    constructor() {
        super();
        this.setRequiresDatasources(false);
        this.setUpdateable(true);
    }

    create(): any {

    }

    update(bbox, zoom, confs) {

    }
}


