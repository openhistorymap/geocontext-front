import { Layer } from '@modalnodes/mn-geo-layers';
import * as L from 'leaflet';


export abstract class StamenLayer extends Layer {

    layer: string;
    type: string;
    minZoom: string;
    maxZoom: string;
    
    SUBDOMAINS = 'a. b. c. d.'.split(' ');
    
    PROVIDERS = {
        toner: this.MAKE_PROVIDER('toner', 'png', 0, 20),
        terrain: this.MAKE_PROVIDER('terrain', 'png', 0, 18),
        'terrain-classic': this.MAKE_PROVIDER('terrain-classic', 'png', 0, 18),
        watercolor: this.MAKE_PROVIDER('watercolor', 'jpg', 1, 18),
    };
    odbl = [
        'toner',
        'toner-hybrid',
        'toner-labels',
        'toner-lines',
        'toner-background',
        'toner-lite',
        'terrain',
        'terrain-background',
        'terrain-lines',
        'terrain-labels',
        'terrain-classic'
    ];
    
    MAKE_PROVIDER(layer, type, minZoom, maxZoom) {
        return {
            url: ['http://{S}tile.stamen.com/', layer, '/{Z}/{X}/{Y}.', type].join(''),
            type: type,
            subdomains: this.SUBDOMAINS.slice(),
            minZoom: minZoom,
            maxZoom: maxZoom,
            attribution: [
                'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, ',
                'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ',
                'Data by <a href="http://openstreetmap.org/">OpenStreetMap</a>, ',
                'under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
            ].join('')
        };
    }





    deprecate(base, flavors) {
        const provider = this.getProvider(base);

        for (let i = 0; i < flavors.length; i++) {
            const flavor = [base, flavors[i]].join('-');
            this.PROVIDERS[flavor] = this.MAKE_PROVIDER(flavor, provider.type, provider.minZoom, provider.maxZoom);
            this.PROVIDERS[flavor].deprecated = true;
        }
    }

/*
 * A shortcut for specifying 'flavors' of a style, which are assumed to have the
 * same type and zoom range.
 */
    setupFlavors(base, flavors, type?) {
        const provider = this.getProvider(base);
        for (let i = 0; i < flavors.length; i++) {
            const flavor = [base, flavors[i]].join('-');
            this.PROVIDERS[flavor] = this.MAKE_PROVIDER(flavor, type || provider.type, provider.minZoom, provider.maxZoom);
        }
    }

    getProvider(name) {
        if (name in this.PROVIDERS) {
            const provider = this.PROVIDERS[name];
            if (provider.deprecated && console && console.warn) {
              console.warn(name + ' is a deprecated style; it will be redirected to its replacement. For performance improvements, please change your reference.');
            }

            return provider;
        } else {
            throw Error('No such provider (' + name + ')');
        }
    }


    constructor(layer: string) {
        super();
        this.layer = layer;
        this.PROVIDERS['terrain-classic'].url = 'http://{S}tile.stamen.com/terrain/{Z}/{X}/{Y}.png';

        // set up toner and terrain flavors
        this.setupFlavors('toner', ['hybrid', 'labels', 'lines', 'background', 'lite']);
        this.setupFlavors('terrain', ['background', 'labels', 'lines']);

        // toner 2010
        this.deprecate('toner', ['2010']);

        // toner 2011 flavors
        this.deprecate('toner', ['2011', '2011-lines', '2011-labels', '2011-lite']);


        for (let i = 0; i < this.odbl.length; i++) {
            const key = this.odbl[i];

            this.PROVIDERS[key].retina = true;
            this.PROVIDERS[key].attribution = [
                'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, ',
                'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ',
                'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, ',
                'under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
            ].join('');
        }

    }
    protected getOptions() {
        const provider = this.getProvider(this.layer);
        const url = provider.url.replace(/({[A-Z]})/g, function (s) {
            return s.toLowerCase();
        });
        const opts = L.Util.extend({}, {
            'minZoom': provider.minZoom,
            'maxZoom': provider.maxZoom,
            'subdomains': provider.subdomains,
            'scheme': 'xyz',
            'attribution': provider.attribution,
            sa_id: name
        });

        return {url: url, opts: opts};
    }

    create() {
        const opts = this.getOptions();
        const r = L.tileLayer(opts.url, opts.opts);
        return r;
    }
}

export class StamenTonerLayer extends StamenLayer {
    constructor() {
        super('toner');
    }
}
export class StamenTonerLiteLayer extends StamenLayer {
    constructor() {
        super('toner-lite');
    }
}

export class StamenWatercolorLayer extends StamenLayer {
    constructor() {
        super('watercolor');
    }
}

export class StamenTerrainLayer extends StamenLayer {
    constructor() {
        super('terrain');
    }
}



