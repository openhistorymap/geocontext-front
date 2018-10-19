import { Datasource, RemoteHttpDatasource } from '@modalnodes/mn-geo-datasources';
import { Papa } from 'ngx-papaparse';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as turf from '@turf/turf';

export class CsvDatasource extends Datasource {
  prepareData(data: any) {
    console.log(data);
    const p = new Papa().parse(data, {
      header: true
    });
    const lon_col = this._conf.structure.filter(x => x.tags && x.tags.indexOf('gcx:lon') >= 0)[0].column;
    const lat_col = this._conf.structure.filter(x => x.tags && x.tags.indexOf('gcx:lat') >= 0)[0].column;
    const ret = {
      type: 'FeatureCollection',
      features: p.data.map(xx => {
        return {
          properties: xx,
          geometry: {
            type: 'Point',
            coordinates: [xx[lon_col], xx[lat_col]]
          }
        };
      })
    };
    console.log('ret', ret);
    return turf.voronoi(ret, {bbox:bbox(ret)});
  }

}


export class CsvRemoteHttpDatasource extends RemoteHttpDatasource {

  fetchData(): Observable < any > {
    return this.http.get(this._conf.source, {
      responseType: 'text'
    }).pipe(map(data => {
      this._data = this.prepareData(data);
      this._ready = true;
      return this._data;
    }));

  }

  prepareData(data: any) {
    console.log(data);
    const p = new Papa().parse(data, {
      header: true,
      skipEmptyLines: true
    });
    const lon_col = this._conf.structure.filter(x => x.tags && x.tags.indexOf('gcx:lon') >= 0)[0].column;
    const lat_col = this._conf.structure.filter(x => x.tags && x.tags.indexOf('gcx:lat') >= 0)[0].column;

    const ret = {
      type: 'FeatureCollection',
      features: p.data.filter(xx => {
        return xx[lon_col] !== null;
      }).map(xx => {
        return {
          type: 'Feature',
          properties: xx,
          conf: this._conf.structure,
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(xx[lon_col]), parseFloat(xx[lat_col])]
          }
        };
      })
    };
    console.log('ret', ret);
    return voronoi(ret, bbox(ret));
  }
}
