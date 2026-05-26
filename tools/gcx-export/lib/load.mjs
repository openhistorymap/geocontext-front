/**
 * Load a GeoContext repo's config + datasets and resolve every
 * datasource down to a final FeatureCollection. Mirrors the runtime
 * pipeline in @openhistorymap/mn-geo-datasources but does it from a
 * local filesystem (no jsdelivr hop).
 *
 *   loadGcxRepo(repoDir) →
 *     {
 *       config:        the parsed gcx.json,
 *       datasources:   Map<name, FeatureCollection>,
 *     }
 *
 * Supports `geojson`, `geojson+http+remote` (resolved locally as
 * `<repoDir>/<conf.source>`), and `transform` datasources with a
 * `buffer` step (replicated via `@turf/buffer` — same logic as the
 * runtime's transform.datasource.ts).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { buffer } from '@turf/buffer';

/**
 * @typedef {{ type: string, [k: string]: any }} DatasourceTransform
 */

const GCX_FILENAMES = ['geocontext.json', 'gcx.json'];

export async function loadGcxRepo(repoDir) {
  const config = await readConfig(repoDir);
  const datasources = await resolveDatasources(repoDir, config.datasources ?? []);
  return { config, datasources };
}

async function readConfig(repoDir) {
  for (const name of GCX_FILENAMES) {
    const p = path.join(repoDir, name);
    try {
      const text = await fs.readFile(p, 'utf8');
      return JSON.parse(text);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
  throw new Error(`gcx-export: no geocontext.json or gcx.json in ${repoDir}`);
}

/**
 * Resolve datasources in dependency-order waves — same shape as
 * DatasourcesmanagerService.fetchDatasources in mn-geo-datasources.
 * Plain (geojson) datasources have no dependencies and resolve in
 * the first wave; `transform` datasources declare `conf.from` and
 * wait for their parent.
 */
async function resolveDatasources(repoDir, declarations) {
  const resolved = new Map(); // name → FeatureCollection
  let pending = declarations.slice();

  while (pending.length) {
    const ready = pending.filter((d) =>
      depsOf(d).every((dep) => resolved.has(dep)),
    );
    if (!ready.length) {
      const names = pending
        .map((d) => `${d.name} ← ${depsOf(d).join(', ') || '∅'}`)
        .join('; ');
      throw new Error(
        `gcx-export: unresolvable datasource dependencies for [${names}]`,
      );
    }
    for (const d of ready) {
      const data = await resolveOne(repoDir, d, resolved);
      resolved.set(d.name, data);
    }
    pending = pending.filter((d) => !ready.includes(d));
  }

  return resolved;
}

function depsOf(d) {
  if (d.type === 'transform' && typeof d.conf?.from === 'string') {
    return [d.conf.from];
  }
  return [];
}

async function resolveOne(repoDir, decl, resolved) {
  switch (decl.type) {
    case 'geojson': {
      // inline data; pass through
      return decl.conf?.data ?? { type: 'FeatureCollection', features: [] };
    }
    case 'geojson+http+remote': {
      const src = decl.conf?.source;
      if (!src) {
        throw new Error(`datasource "${decl.name}": conf.source missing`);
      }
      const p = path.join(repoDir, src);
      const text = await fs.readFile(p, 'utf8');
      return JSON.parse(text);
    }
    case 'transform': {
      const from = decl.conf?.from;
      const parent = resolved.get(from);
      if (!parent) {
        throw new Error(`datasource "${decl.name}": parent "${from}" not resolved`);
      }
      const transforms = Array.isArray(decl.conf?.transforms)
        ? decl.conf.transforms
        : [];
      return applyTransforms(parent, transforms);
    }
    default:
      console.warn(
        `gcx-export: unsupported datasource type "${decl.type}" for "${decl.name}" — emitting empty FC`,
      );
      return { type: 'FeatureCollection', features: [] };
  }
}

/**
 * Mirror of mn-geo-datasources/transform.datasource.ts: sanitise the
 * input then apply each step in order. A step that throws is skipped
 * with a console warning rather than dropping the whole chain.
 */
function applyTransforms(data, transforms) {
  if (!data || !transforms.length) return data;
  let current = sanitiseFC(data);
  for (const t of transforms) {
    try {
      current = applyTransform(current, t) ?? current;
    } catch (err) {
      console.warn(
        `gcx-export: transform step "${t?.type}" threw; data passes through`,
        err.message ?? err,
      );
    }
  }
  return current;
}

function sanitiseFC(data) {
  if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    return data;
  }
  const cleaned = data.features.filter(
    (f) => f && f.geometry && typeof f.geometry.type === 'string',
  );
  if (cleaned.length === data.features.length) return data;
  return { ...data, features: cleaned };
}

function applyTransform(data, t) {
  if (!t || typeof t !== 'object' || typeof t.type !== 'string') return data;
  switch (t.type) {
    case 'buffer': {
      const radius = Number(t.radius);
      if (!Number.isFinite(radius) || radius === 0) return data;
      const units = t.units ?? 'meters';
      const steps = Number.isFinite(t.steps) ? Number(t.steps) : 8;
      return buffer(data, radius, { units, steps });
    }
    default:
      console.warn(`gcx-export: unknown transform step "${t.type}"`);
      return data;
  }
}
