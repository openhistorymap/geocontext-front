/**
 * Vector-SVG rendering for a resolved GeoContext repo. Takes the gcx
 * config + a map<name,FeatureCollection> of resolved datasources and
 * produces a single self-contained SVG document plus a georeference
 * sidecar (`{ bbox, crs, size }`).
 *
 * Conventions kept consistent with the runtime renderer:
 *   - gcx.json layers[0] = drawn on top. SVG paints in document order
 *     (last = on top), so we EMIT in reverse.
 *   - WGS84 lon/lat → SVG (x, y) via the bbox; Y is flipped so that
 *     north is up.
 *   - background-color background option = a `<rect>` painted before
 *     any feature group. Raster basemaps (osm tiles, image-overlays)
 *     are deliberately skipped — gcx-export targets the vector overlay,
 *     not the raster underlay.
 *
 * Style support per layer:
 *   - style.mode = "marker"   → <circle> per Point feature
 *   - style.mode = "line"     → <path> per Line/MultiLine
 *   - style.mode = "polygon"  → <path> per Polygon/MultiPolygon
 *   - style.maplibre[0] type=fill with a linear `interpolate` on
 *     ["get", <prop>] → per-feature fill computed from that property.
 *     Falls back to style.options for any other maplibre shape.
 */

export function renderSvg({ config, datasources, bbox, width, backgroundId }) {
  const [w, s, e, n] = bbox;
  const aspect = (n - s) / (e - w);
  const height = Math.max(1, Math.round(width * aspect));

  const project = (lon, lat) => {
    const x = ((lon - w) / (e - w)) * width;
    const y = ((n - lat) / (n - s)) * height; // SVG Y goes down
    return [x, y];
  };

  const out = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`,
    `     viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    `<title>${escapeXml(config.title ?? 'GeoContext export')}</title>`,
    `<metadata>`,
    `  <gcx:export xmlns:gcx="https://www.openhistorymap.org/geocontext"`,
    `              bbox="${w},${s},${e},${n}" crs="EPSG:4326"/>`,
    `</metadata>`,
  );

  // Background fill.
  const bgColor = resolveBackgroundColor(config, backgroundId);
  if (bgColor) {
    out.push(
      `<rect width="${width}" height="${height}" fill="${bgColor}"/>`,
    );
  }

  // Paint user layers in reverse order so layers[0] ends up on top.
  const layers = (config.layers ?? []).slice().reverse();
  for (const layer of layers) {
    const ds = layer.datasource ? datasources.get(layer.datasource) : null;
    if (!ds) {
      console.warn(`gcx-export: layer "${layer.name}" — no datasource resolved`);
      continue;
    }
    out.push(`<g id="${escapeXml(slug(layer.name))}" data-gcx-layer="${escapeXml(layer.name)}">`);
    out.push(renderLayer(layer, ds, project));
    out.push(`</g>`);
  }

  out.push(`</svg>`);
  return {
    svg: out.join('\n'),
    sidecar: { bbox: [w, s, e, n], crs: 'EPSG:4326', size: { width, height } },
  };
}

// ---------- per-layer rendering ----------------------------------------

function renderLayer(layer, fc, project) {
  const style = layer.style ?? {};
  const mode = style.mode ?? guessMode(fc);
  const colourEval = compileColourEval(style);

  const parts = [];
  for (const feature of fc.features ?? []) {
    const g = feature.geometry;
    if (!g) continue;
    const fill = colourEval(feature, style);
    switch (mode) {
      case 'marker':
        parts.push(...renderMarker(g, feature, style, fill, project));
        break;
      case 'line':
        parts.push(...renderLine(g, style, fill, project));
        break;
      case 'polygon':
        parts.push(...renderPolygon(g, style, fill, project));
        break;
      default:
        // last-resort: try polygon, then line, then point
        if (/Polygon/.test(g.type)) parts.push(...renderPolygon(g, style, fill, project));
        else if (/LineString/.test(g.type)) parts.push(...renderLine(g, style, fill, project));
        else if (/Point/.test(g.type)) parts.push(...renderMarker(g, feature, style, fill, project));
    }
  }
  return parts.join('\n');
}

function guessMode(fc) {
  const types = new Set();
  for (const f of fc.features ?? []) {
    if (f.geometry?.type) types.add(f.geometry.type);
  }
  if (types.size === 0) return 'marker';
  if ([...types].every((t) => /Polygon/.test(t))) return 'polygon';
  if ([...types].every((t) => /LineString/.test(t))) return 'line';
  if ([...types].every((t) => /Point/.test(t))) return 'marker';
  return 'mixed';
}

// ---------- marker -----------------------------------------------------

function renderMarker(geom, feature, style, fill, project) {
  const o = style.options ?? {};
  const r = o.radius ?? 4;
  const stroke = o.color ?? '#000';
  const sw = o.weight ?? 1;
  const op = o.opacity ?? 1;
  const fop = o.fillOpacity ?? 0.6;
  const points = [];
  walkPoints(geom, (lon, lat) => points.push(project(lon, lat)));
  return points.map(
    ([x, y]) =>
      `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r}" ` +
      `fill="${fill}" fill-opacity="${fop}" ` +
      `stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${op}"/>`,
  );
}

// ---------- line -------------------------------------------------------

function renderLine(geom, style, fill, project) {
  const o = style.options ?? {};
  const stroke = o.color ?? '#333';
  const sw = o.weight ?? 2;
  const op = o.opacity ?? 1;
  const lines = [];
  walkLines(geom, (coords) => lines.push(coords));
  return lines.map((coords) => {
    const d = coords
      .map(([lon, lat], i) => `${i === 0 ? 'M' : 'L'} ${project(lon, lat).map((n) => n.toFixed(2)).join(' ')}`)
      .join(' ');
    return (
      `<path d="${d}" fill="none" ` +
      `stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${op}"/>`
    );
  });
}

// ---------- polygon ----------------------------------------------------

function renderPolygon(geom, style, fill, project) {
  const o = style.options ?? {};
  const stroke = o.color ?? '#333';
  const sw = o.weight ?? 1;
  const op = o.opacity ?? 1;
  const fop = o.fillOpacity ?? 0.4;
  // path-d for a polygon with holes
  const polys = [];
  walkPolygons(geom, (rings) => polys.push(rings));
  return polys.map((rings) => {
    const d = rings
      .map((ring) =>
        ring
          .map(
            ([lon, lat], i) =>
              `${i === 0 ? 'M' : 'L'} ${project(lon, lat).map((n) => n.toFixed(2)).join(' ')}`,
          )
          .join(' ') + ' Z',
      )
      .join(' ');
    return (
      `<path d="${d}" fill="${fill}" fill-opacity="${fop}" fill-rule="evenodd" ` +
      (sw > 0
        ? `stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${op}"/>`
        : `stroke="none"/>`)
    );
  });
}

// ---------- colour evaluation -----------------------------------------

/**
 * Build a per-feature fill colour evaluator. Falls back to
 * style.options.fillColor, unless a MapLibre paint expression is
 * declared that we can interpret — specifically `["interpolate",
 * ["linear"], ["get", <prop>], stop, color, …]` on a `fill` layer.
 */
function compileColourEval(style) {
  const ml = Array.isArray(style?.maplibre)
    ? style.maplibre.find((l) => l?.type === 'fill' && l?.paint?.['fill-color'])
    : null;
  const expr = ml?.paint?.['fill-color'];
  if (Array.isArray(expr) && expr[0] === 'interpolate') {
    const lin = expr[1];
    const input = expr[2];
    if (Array.isArray(lin) && lin[0] === 'linear' && Array.isArray(input) && input[0] === 'get') {
      const propName = input[1];
      // Pairs: [stop, color, stop, color, …]
      const stops = [];
      for (let i = 3; i + 1 < expr.length; i += 2) {
        stops.push([Number(expr[i]), String(expr[i + 1])]);
      }
      stops.sort((a, b) => a[0] - b[0]);
      return (feature) => {
        const v = Number(feature?.properties?.[propName]);
        if (!Number.isFinite(v)) return style?.options?.fillColor ?? '#888';
        return interpolateColour(stops, v);
      };
    }
  }
  const fallback = style?.options?.fillColor ?? '#888';
  return () => fallback;
}

function interpolateColour(stops, v) {
  if (v <= stops[0][0]) return stops[0][1];
  if (v >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [s0, c0] = stops[i];
    const [s1, c1] = stops[i + 1];
    if (v >= s0 && v <= s1) {
      const t = (v - s0) / (s1 - s0);
      return mixHex(c0, c1, t);
    }
  }
  return stops[0][1];
}

function mixHex(a, b, t) {
  const pa = parseHex(a);
  const pb = parseHex(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const blu = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return '#' + [r, g, blu].map((n) => n.toString(16).padStart(2, '0')).join('');
}

function parseHex(s) {
  const m = /^#?([0-9a-f]{6})$/i.exec(s);
  if (!m) return [128, 128, 128];
  return [
    parseInt(m[1].slice(0, 2), 16),
    parseInt(m[1].slice(2, 4), 16),
    parseInt(m[1].slice(4, 6), 16),
  ];
}

// ---------- geometry walkers -------------------------------------------

function walkPoints(geom, cb) {
  if (geom.type === 'Point') {
    cb(geom.coordinates[0], geom.coordinates[1]);
  } else if (geom.type === 'MultiPoint') {
    for (const [lon, lat] of geom.coordinates) cb(lon, lat);
  }
}

function walkLines(geom, cb) {
  if (geom.type === 'LineString') {
    cb(geom.coordinates);
  } else if (geom.type === 'MultiLineString') {
    for (const part of geom.coordinates) cb(part);
  }
}

function walkPolygons(geom, cb) {
  if (geom.type === 'Polygon') {
    cb(geom.coordinates);
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) cb(poly);
  }
}

// ---------- background ------------------------------------------------

function resolveBackgroundColor(config, requestedId) {
  const bgs = Array.isArray(config.backgrounds) ? config.backgrounds : [];
  if (!bgs.length) {
    // Legacy single-form background — only honour the string "none"-ish case
    return null;
  }
  const wanted =
    (requestedId && bgs.find((b) => b.id === requestedId)) ||
    (typeof config.background === 'string' && bgs.find((b) => b.id === config.background)) ||
    bgs[0];
  if (wanted?.type === 'background-color') {
    return wanted.conf?.color ?? null;
  }
  return null;
}

// ---------- helpers ----------------------------------------------------

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '');
}
function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- bbox helper (exported for the CLI) -------------------------

export function computeBbox(datasources) {
  let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
  for (const fc of datasources.values()) {
    for (const feat of fc.features ?? []) {
      if (!feat.geometry) continue;
      walkAnyCoords(feat.geometry.coordinates, (lon, lat) => {
        if (lon < xmin) xmin = lon;
        if (lon > xmax) xmax = lon;
        if (lat < ymin) ymin = lat;
        if (lat > ymax) ymax = lat;
      });
    }
  }
  if (!isFinite(xmin)) {
    throw new Error('gcx-export: empty dataset — no bbox to compute');
  }
  return [xmin, ymin, xmax, ymax];
}

function walkAnyCoords(c, cb) {
  if (typeof c[0] === 'number') {
    cb(c[0], c[1]);
  } else {
    for (const part of c) walkAnyCoords(part, cb);
  }
}
