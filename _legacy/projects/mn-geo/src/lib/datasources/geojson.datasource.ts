import { Datasource, RemoteHttpDatasource } from '@modalnodes/mn-geo-datasources';

export class GeoJsonDatasource extends Datasource {
    prepareData(data) {
        return data;
    }
}

export class GeoJsonRemoteHttpDatasource extends RemoteHttpDatasource {
    prepareData(data) {
        return data;
    }
}
