import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Papa from 'papaparse';
import { Datasource, RemoteHttpDatasource } from '@openhistorymap/mn-geo-datasources';

interface CsvStructureField {
  column: string;
  type: string;
  tags?: string[];
}

function parseCoord(value: any): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

function findTaggedColumn(structure: CsvStructureField[] | undefined, tag: string): string | undefined {
  return structure?.find((s) => s.tags?.includes(tag))?.column;
}

function rowsToFeatureCollection(
  rows: any[],
  structure: CsvStructureField[] | undefined,
): { type: 'FeatureCollection'; features: any[] } {
  const lonCol = findTaggedColumn(structure, 'gcx:lon');
  const latCol = findTaggedColumn(structure, 'gcx:lat');
  if (!lonCol || !latCol) {
    throw new Error(
      'csv datasource: conf.structure must include columns tagged "gcx:lon" and "gcx:lat".',
    );
  }
  const features: any[] = [];
  for (const row of rows) {
    const lon = parseCoord(row[lonCol]);
    const lat = parseCoord(row[latCol]);
    if (lon === null || lat === null) continue;
    features.push({
      type: 'Feature',
      properties: row,
      geometry: { type: 'Point', coordinates: [lon, lat] },
    });
  }
  return { type: 'FeatureCollection', features };
}

export class CsvDatasource extends Datasource {
  override prepareData(data: any): any {
    if (typeof data !== 'string') return data;
    const parsed = Papa.parse<any>(data, { header: true, skipEmptyLines: true });
    return rowsToFeatureCollection(parsed.data, this._conf?.structure);
  }
}

export class CsvRemoteHttpDatasource extends RemoteHttpDatasource {
  override fetchData(): Observable<any> {
    if (!this.http) {
      throw new Error('CsvRemoteHttpDatasource: HttpClient not injected.');
    }
    return this.http
      .get(this._conf.source, { responseType: 'text' })
      .pipe(
        tap((text) => {
          this._data = this.prepareData(text);
          this._ready = true;
        }),
      ) as Observable<any>;
  }

  override prepareData(data: any): any {
    if (typeof data !== 'string') return data;
    const parsed = Papa.parse<any>(data, { header: true, skipEmptyLines: true });
    return rowsToFeatureCollection(parsed.data, this._conf?.structure);
  }
}
