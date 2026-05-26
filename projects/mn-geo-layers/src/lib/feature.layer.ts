import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { buffer } from '@turf/buffer';
import { Layer } from './layer.interface';
import { GeoJsonFeaturesDescriptor } from './descriptors';
import { MnGeoLayersRegistryService } from './mn-geo-layers-registry.service';

/**
 * One step of a feature-layer data-transform pipeline declared in
 * `gcx.json`. The pipeline is applied IN ORDER, on the client, after the
 * datasource resolves and before the descriptor is emitted — so style
 * (`polygon`/`line`/`marker`) can target the transformed geometry.
 *
 * Currently dispatchable types:
 *   - `buffer`  — `@turf/buffer`; `radius` + optional `units` (default
 *                  `meters`) + optional `steps` (default 8). Use to draw
 *                  a metric-accurate ring around point/line/polygon
 *                  features (e.g. the physical footprint of palisade
 *                  posts) without pre-computing a derived dataset.
 *
 * Unknown `type` values are logged once and the data passes through.
 */
export interface LayerTransform {
  type: string;
  [k: string]: any;
}

/**
 * Apply a `transforms[]` pipeline (declared in gcx.json) to a
 * FeatureCollection. Each step receives the previous step's output, so
 * the order matters. Failures fall through with a warning — better to
 * draw the un-transformed data than to drop the layer entirely.
 *
 * Sanitises the input first: turf operations (buffer, simplify, …)
 * throw on features with null/missing geometry, which is a real shape
 * in field-collected datasets (e.g. one of the 83 palificazioni rows
 * has null geometry). Dropping those features before the pipeline
 * keeps a single bad row from invalidating the whole transformed
 * layer.
 */
function applyTransforms(data: any, transforms: LayerTransform[]): any {
  if (!data || !transforms?.length) return data;
  let current = sanitiseFeatureCollection(data);
  for (const t of transforms) {
    try {
      current = applyTransform(current, t) ?? current;
    } catch (err) {
      console.warn(
        `mn-geo-layers: transform "${t?.type}" threw; data passes through`,
        err,
      );
    }
  }
  return current;
}

/**
 * Return a copy of the FeatureCollection with null-geometry features
 * removed. Non-FC inputs (single feature/geometry) pass through. Does
 * not mutate the source.
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

function applyTransform(data: any, t: LayerTransform): any {
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
      console.warn(`mn-geo-layers: unknown transform type "${t.type}"`);
      return data;
  }
}

/**
 * Renders a datasource's resolved GeoJSON as a `geojson-features` descriptor.
 * The datasource (`gcx.json` `datasources[].name`) must already be registered
 * — `LayersmanagerService.displayLayers()` defers feature layers until
 * `DatasourcesmanagerService.fetchDatasources()` resolves.
 *
 * Optional `conf.transforms[]` runs a client-side data pipeline (turf-
 * backed) before the descriptor is emitted, so an existing point/line
 * datasource can be drawn buffered / simplified / filtered without
 * shipping a derived file.
 */
export class FeatureLayer extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(true);
  }

  override create(): GeoJsonFeaturesDescriptor {
    const conf = this.getConfiguration() ?? {};
    const datasourceName: string | undefined = conf.datasource;
    let data =
      datasourceName !== undefined
        ? this.getDatasourceManager().getDatasource(datasourceName)
        : conf.data;

    // Run the transform pipeline (if any). Applied here, on the client,
    // so a layer can declare `{ type: 'buffer', radius: 0.15 }` against
    // an existing point datasource and the buffered polygons become the
    // descriptor's data; both flavours then render them through the
    // declared `style.options` / `style.maplibre`.
    const transforms = Array.isArray(conf.transforms)
      ? (conf.transforms as LayerTransform[])
      : [];
    if (transforms.length) {
      data = applyTransforms(data, transforms);
    }

    const style = conf.styles?.[0] ?? conf.style;
    // `interactive: false` marks the layer as visual context only — no
    // click handler, no popup, no cursor change. Both flavours gate hover
    // and click wiring on the descriptor's `onClick`/`popup`, so omitting
    // them is enough to disable interaction end-to-end.
    const interactive = conf.interactive !== false;

    const desc: GeoJsonFeaturesDescriptor = {
      kind: 'geojson-features',
      id: this.getName() || datasourceName || 'features',
      data: data ?? { type: 'FeatureCollection', features: [] },
      style,
    };
    if (interactive) {
      desc.onClick = (feature: any) => this.featureClicked(feature);
    }
    return desc;
  }
}

/**
 * Registers the `feature` (alias `features`) layer type — the common GeoJSON
 * renderer — with `MnGeoLayersRegistryService`. Drop into `app.config`'s
 * providers; pairs with `provideMnGeoDatasourcesGeojson()` from
 * `@openhistorymap/mn-geo-datasources` for static GeoJSON files.
 */
export function provideMnGeoLayersFeature(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const reg = inject(MnGeoLayersRegistryService);
    reg.register('feature', FeatureLayer);
    reg.register('features', FeatureLayer);
  });
}
