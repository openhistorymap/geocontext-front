# gcx-export

A standalone Node CLI that exports a GeoContext repository — its
`gcx.json` and the referenced GeoJSON datasets — as a single vector
SVG, with a georeference sidecar that downstream tools (gdal,
ImageMagick, …) can consume to produce a GeoTIFF.

The SVG mirrors what the front-end map shows, with three explicit
limits:

- the `viewBox` is bbox-driven, not zoom-driven — there's no
  pixel-perfect equivalence to the on-screen render;
- raster basemaps (OSM tiles, the WMS-captured image-overlays) are
  **not** embedded — only the `background-color` background-type is
  honoured, painted as the SVG's base fill;
- the MapLibre escape hatch (`style.maplibre`) is interpreted only
  for the data-driven `interpolate(linear, ["get", <prop>], …)`
  case used by the dossi elevation gradient — that's what we have
  in the wild; other forms fall back to `style.options`.

## Usage

```bash
# from anywhere in the workspace
node tools/gcx-export/bin/gcx-export.mjs <path-to-geocontext-repo> [options]

# example
node tools/gcx-export/bin/gcx-export.mjs ~/work/valle_trebba \
  --out ~/work/valle_trebba/exports/valle_trebba.svg \
  --width 4096
```

Options:

| Flag | Default | Notes |
|---|---|---|
| `--out <path>` | `<repo>/exports/<basename>.svg` | output SVG path; a `.bbox.json` sidecar is written next to it. |
| `--width <px>` | `4096` | pixel width of the SVG viewBox. Height is derived from the bbox aspect ratio. |
| `--bbox <W,S,E,N>` | union of all features | clip / pad the export to a specific WGS84 bbox. |
| `--background <id>` | the `background` field in gcx.json, else the first entry | which `backgrounds[]` option to use for the base colour. |

The sidecar `<out>.bbox.json` has the shape:

```json
{
  "bbox":  [west, south, east, north],
  "crs":   "EPSG:4326",
  "size":  { "width": 4096, "height": 5670 }
}
```

## Going from SVG to GeoTIFF

```bash
# 1. rasterise SVG → PNG at the same pixel size
rsvg-convert -w 4096 valle_trebba.svg > valle_trebba.png

# 2. attach georeference, write GeoTIFF
gdal_translate \
  -of GTiff \
  -a_srs EPSG:4326 \
  -a_ullr $WEST $NORTH $EAST $SOUTH \
  valle_trebba.png valle_trebba.tif
```

The four values come straight from the sidecar's `bbox` (`-a_ullr`
takes upper-left then lower-right, so `W N E S`).

## What's rendered

In layer-stack order (gcx.json `layers[0]` = on top):

1. data layers — features rendered with `style.options` for the
   mode (marker/line/polygon). Markers become `<circle>`s, lines
   `<polyline>`s, polygons `<path>`s. Stroke + fill use the
   declared `color`, `weight`, `opacity`, `fillColor`, `fillOpacity`.
2. dossi elevation gradient — when a layer's `style.maplibre[0]`
   is a `fill` with a linear-interpolate `fill-color` on a feature
   property, each polygon is rendered with the interpolated colour
   computed from that property.
3. transform datasources — `{ "type": "transform", "conf": { from,
   transforms: [{ buffer }] } }` is replicated offline using
   `@turf/buffer` (UTM 32N reproject → buffer → back), so the
   wood-coloured 15 cm palificazione buffers match what the runtime
   draws.
4. background-color — drawn as a full-canvas `<rect>` beneath
   everything. Other background types (raster-tiled, image-overlay)
   are skipped.

## Limits worth knowing

- No coordinate-system handling beyond WGS84 — all datasets are
  assumed CRS84/lon-lat (this is the GeoContext convention).
- No automatic projection to Web Mercator. The SVG is in equirectangular
  pixel space, scaled by the bbox. For small areas (a couple of km,
  like Valle Trebba) this is visually indistinguishable from Mercator
  at this latitude. For continental-scale exports it would distort —
  add a `--proj epsg:3857` later if needed.
- No basemap raster — by design (the user picks raster downstream
  if they want it).
