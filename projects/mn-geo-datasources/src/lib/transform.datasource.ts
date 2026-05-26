import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { Observable, of } from 'rxjs';
import { buffer } from '@turf/buffer';
import { Datasource } from './datasource';
import { MnGeoDatasourcesRegistryService } from './mn-geo-datasources-registry.service';

/**
 * One step in a `transform` datasource's pipeline. Steps run in order
 * on the parent's resolved data. Currently dispatchable types:
 *
 *   - `buffer` — `@turf/buffer`; `radius` (number, required) + optional
 *                `units` (`meters`/`kilometers`/`miles`/`feet`/`radians`/
 *                `degrees`; default `meters`) + optional `steps`
 *                (default 8). Buffers each feature; points become small
 *                circles, lines become widened bands, polygons grow.
 *
 * Unknown types log a warning and pass the data through.
 */
export interface DatasourceTransform {
  type: string;
  [k: string]: any;
}

/**
 * Derived datasource: takes another datasource's resolved GeoJSON
 * (`conf.from`) and runs a `transforms[]` pipeline on it to produce a
 * new FeatureCollection. Registered as type `transform`.
 *
 * Dependency: `getDependencies()` reports `[conf.from]` so the
 * DatasourcesmanagerService schedules this in a wave AFTER the parent
 * is resolved. At `fetchData()` time, the parent's data is looked up
 * via the registry (the registry returns data for already-resolved
 * names) and the pipeline is applied.
 *
 * Failure modes:
 *   - Missing `conf.from` or unknown parent name → throws (loud, easy
 *     to diagnose).
 *   - A pipeline step throws (e.g. turf chokes on a feature) → that
 *     step is skipped with a console warning; the previous step's
 *     output passes to the next step. Better to render some data than
 *     none. (Null geometries are filtered out before the pipeline as
 *     a separate pre-pass — turf's iterators trip on them.)
 */
export class TransformDatasource extends Datasource {
  private registry: MnGeoDatasourcesRegistryService | null = null;

  override setup(setup: Record<string, unknown>): void {
    if (setup && (setup as any).registry) {
      this.registry = (setup as any).registry as MnGeoDatasourcesRegistryService;
    }
  }

  override getDependencies(): string[] {
    const from = this._conf?.from;
    return typeof from === 'string' && from.length ? [from] : [];
  }

  override fetchData(): Observable<any> {
    const from: string | undefined = this._conf?.from;
    if (!from) {
      throw new Error(
        `transform datasource "${this._name}": conf.from is required`,
      );
    }
    if (!this.registry) {
      throw new Error(
        `transform datasource "${this._name}": registry not wired via setup()`,
      );
    }
    const parentData = this.registry.for(from);
    if (!parentData || typeof parentData !== 'object' || typeof parentData.type !== 'string') {
      throw new Error(
        `transform datasource "${this._name}": parent "${from}" did not resolve to GeoJSON`,
      );
    }
    const transforms = Array.isArray(this._conf?.transforms)
      ? (this._conf.transforms as DatasourceTransform[])
      : [];
    this._data = this.prepareData(applyTransforms(parentData, transforms));
    this._ready = true;
    return of(this._data);
  }

  override prepareData(data: any): any {
    return data;
  }
}

/**
 * Drop features with null/missing geometry. Turf operations (buffer,
 * simplify, …) iterate features and read `geometry.type` directly,
 * crashing on null. Field-collected datasets do contain null-geometry
 * rows (e.g. one of the 83 palificazioni features), and a single bad
 * row would otherwise invalidate the whole transformed layer.
 */
function sanitiseFeatureCollection(data: any): any {
  if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    return data;
  }
  const cleaned = data.features.filter(
    (f: any) => f && f.geometry && typeof f.geometry.type === 'string',
  );
  if (cleaned.length === data.features.length) return data;
  return { ...data, features: cleaned };
}

function applyTransforms(data: any, transforms: DatasourceTransform[]): any {
  if (!data || !transforms.length) return data;
  let current = sanitiseFeatureCollection(data);
  for (const t of transforms) {
    try {
      current = applyTransform(current, t) ?? current;
    } catch (err) {
      console.warn(
        `transform datasource: step "${t?.type}" threw; previous step's output passes through`,
        err,
      );
    }
  }
  return current;
}

function applyTransform(data: any, t: DatasourceTransform): any {
  if (!t || typeof t !== 'object' || typeof t.type !== 'string') return data;
  switch (t.type) {
    case 'buffer': {
      const radius = Number(t['radius']);
      if (!Number.isFinite(radius) || radius === 0) return data;
      const units = (t['units'] ?? 'meters') as
        | 'meters' | 'kilometers' | 'miles' | 'feet' | 'radians' | 'degrees';
      const steps = Number.isFinite(t['steps']) ? Number(t['steps']) : 8;
      return buffer(data, radius, { units, steps });
    }
    default:
      console.warn(`transform datasource: unknown step type "${t.type}"`);
      return data;
  }
}

/**
 * Register the `transform` datasource type. Drop into `app.config`'s
 * providers alongside `provideMnGeoDatasourcesGeojson()`. Brings in
 * `@turf/buffer` so the lib stays opt-in for apps that don't use
 * derived datasources.
 */
export function provideMnGeoDatasourcesTransform(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const reg = inject(MnGeoDatasourcesRegistryService);
    reg.register('transform', TransformDatasource);
  });
}
