# GeoContext file format

Reference for the JSON file GeoContext loads to render a map. Intended for
downstream tools (e.g. `geocontext-qgis`) that author or validate the file
without reading the front-end source.

The front-end at `geocontext-front` is the source of truth — if this
document and the runtime disagree, the runtime wins; please open a PR.

---

## 1. Filename & location

A GeoContext file is one JSON file at the root of a public GitHub repo:

| Name | Status |
|---|---|
| `geocontext.json` | Preferred. |
| `gcx.json` | Legacy. Still loaded if `geocontext.json` is absent. |

When the front-end loads a repo via `/<user>/<project>/map`, it probes
`geocontext.json` first, then `gcx.json`. Override with
`?path=<other>.json`.

The file is fetched from `cdn.jsdelivr.net/gh/<user>/<project>@<ref>/`,
where `<ref>` defaults to `HEAD` (the default branch) and can be set
with `?branch=<ref>` (a branch, tag, or commit SHA — jsDelivr does
not distinguish).

---

## 2. Top-level shape

```jsonc
{
  "title":      "Valle Trebba",        // string, shown in the toolbar
  "type":       "2d",                  // reserved; always "2d" today
  "center":     [44.702654, 12.121156],// [lat, lon] — note: lat first
  "minzoom":    1,
  "startzoom":  15,
  "maxzoom":    20,

  "background": "osm",                 // optional, see §7
  "dem":        false,                 // optional, see §8
  "search":     true,                  // optional; toggles search UI
  "showLayerSelector": true,           // optional (default true); when false
                                       // the sidebar hides the Layers tab
                                       // entirely (only Details remains)

  "datasources": [ /* §3 */ ],
  "layers":      [ /* §4 */ ]
}
```

Coordinate convention: `center` is `[lat, lon]` (matches everyday
human notation "44°N 12°E" and Leaflet's `LatLng`). Inside GeoJSON
features the spec-mandated `[lon, lat]` order applies — these are
unrelated.

Zoom levels follow the slippy-map convention (0 = whole world,
22 = street-level).

Unknown top-level keys are preserved but ignored.

---

## 3. Datasources

A datasource fetches and exposes data to layers. Layers reference a
datasource by `name`.

```jsonc
{
  "name": "graves",                    // unique within `datasources[]`
  "type": "geojson+http+remote",       // see catalogue below
  "conf": {
    "source": "datasets/graves.geojson"
  }
}
```

### Built-in `type` values

| Type | Purpose | Required `conf` keys |
|---|---|---|
| `geojson` | Inline FeatureCollection. | `data` (the FeatureCollection) |
| `geojson+http+remote` | Fetches a GeoJSON file. | `source` |
| `csv` | Inline CSV string. | `data`, `structure[]` |
| `csv+http+remote` | Fetches a CSV file. | `source`, `structure[]` |
| `transform` | **Derived** — runs a client-side pipeline on another datasource's resolved GeoJSON. | `from` (parent name), `transforms[]` |

### `transform` datasources

A `transform` datasource is purely derived: it doesn't fetch
anything, it takes another datasource's resolved GeoJSON (named in
`conf.from`) and runs an ordered `transforms[]` pipeline on it,
producing a new FeatureCollection that any number of layers can
visualise.

```jsonc
{
  "name": "palificazioni_legno",
  "type": "transform",
  "conf": {
    "from": "valle_trebba_palificazioni",
    "transforms": [
      { "type": "buffer", "radius": 0.15, "units": "meters" }
    ]
  }
}
```

Mechanics:

- The datasource manager resolves datasources in dependency-order
  waves: a `transform` declares its parent via `conf.from` and the
  manager runs it only after the parent has resolved. Chains of
  transforms (transform-of-transform) work — the manager iterates
  waves until none remain pending.
- Features with null/missing geometry are dropped before the
  pipeline (turf operations crash on them; one bad row would
  otherwise invalidate the whole derived layer).
- A pipeline step that throws is skipped with a console warning;
  the previous step's output continues through.
- The transform runs **on the client**; the underlying file on
  disk is unchanged. A single derived datasource can feed multiple
  layers with different styles or interactivity.

#### Built-in transform steps

| `type`   | Backed by                       | Required params | Optional params |
|----------|---------------------------------|---------------|----------------|
| `buffer` | [`@turf/buffer`](https://turfjs.org/docs/api/buffer) | `radius` (number) | `units` (`meters`/`kilometers`/`miles`/`feet`/`radians`/`degrees` — default `meters`), `steps` (default 8) |

Style mode should match the geometry the pipeline produces (a
`buffer` on points yields polygons → `style.mode: polygon` or
`style.maplibre` with `type: fill`).

### CSV `structure[]`

CSV rows are projected to GeoJSON Points. The `structure` array names
columns and tags semantically — at least one `gcx:lat` and one `gcx:lon`
tagged column are required.

```jsonc
"structure": [
  { "column": "longitude", "type": "number", "tags": ["gcx:lon", "gcx:geo"] },
  { "column": "latitude",  "type": "number", "tags": ["gcx:lat", "gcx:geo"] },
  { "column": "name",      "type": "string", "tags": ["gcx:title"] }
]
```

`source` paths follow the asset-resolution rules in §9.

---

## 4. Layers

A layer is what's rendered. It can reference a datasource (data-driven
layers) or be self-sufficient (basemap, DEM).

```jsonc
{
  "name":       "graves",              // unique; used as the layer id
  "type":       "features",            // see catalogue below
  "datasource": "graves",              // required for data-driven types

  "style":      { /* §5 */ },          // optional
  "detail":     { /* §6 */ },          // optional
  "interactive": true,                 // optional; default true

  "conf":       { /* type-specific */ }// optional
}
```

### Built-in `type` values

| Type | Renders | Datasource required |
|---|---|---|
| `features` (alias `feature`) | GeoJSON as circles / lines / polygons. | yes |
| `markers` | GeoJSON points as map pins, with built-in popups. | yes |
| `raster-tiled` / `osm-tiled` / `ofm-tiled` | XYZ raster tile basemap. | no |
| `raster-dem` | Terrain / hillshade source. | no |
| `vector-tiles` | MVT vector tile source. | no |

Sidebar stacking order = `layers[]` order in the file: `layers[0]`
is drawn on top. The front-end reapplies this order as layers fan in
(datasources resolve async), so the initial visual stack always
matches the declared order.

### `interactive`

Set `"interactive": false` on a `features` or `markers` layer to mark
it as visual context: the geometry still renders but no click handler,
popup, or pointer cursor is wired. Use for coastlines, admin borders,
or anything that should not compete with the data layers above for clicks.

### `visible`

`true` (default) or `false`. Initial visibility of the layer on first
render. When `false`, the layer's data is still loaded and the GL/
Leaflet layer is registered, but it starts hidden — the sidebar
toggle reflects the off state and the user can switch it on.

### `togglable`

`true` (default) or `false`. When `false`, the sidebar omits the
on/off toggle for that row — useful for layers the publisher wants
the visitor to *always* see, or never see (`togglable: false,
visible: false` makes a permanently-hidden context layer).

---

## 5. The `style` block

`style` lives on a layer and tells the renderer how to draw it. Two
levels of control:

### 5.1 High-level (`mode` + `options`)

Cross-flavour (Leaflet AND MapLibre understand it). Covers the common
case: simple, uniform styling per geometry type.

```jsonc
"style": {
  "style":      "mapbox",              // ignored; reserved for future
  "mode":       "marker",              // marker | line | polygon
  "markerType": "circle",              // currently "circle" only
  "options": {
    "radius":      4,
    "fillColor":   "#e77148",
    "color":       "#000",
    "weight":      1,
    "opacity":     1,
    "fillOpacity": 0.6
  }
}
```

Field names match Leaflet's vector-style conventions. MapLibre
translates them into GL style-spec paint properties; geometries that
don't apply (`mode: marker` on a polygon, …) fall back to sensible
defaults.

### 5.2 Raw MapLibre escape hatch (`style.maplibre`)

When the high-level shorthand can't express what you need — data-driven
expressions, zoom interpolations, heatmaps, fill-extrusion — drop down
to **MapLibre GL style-spec layers** directly. This is **only honoured
by the MapLibre flavour**; the Leaflet flavour ignores it and uses
`options`.

```jsonc
"style": {
  "options": {                         // still useful as a Leaflet fallback
    "radius": 4, "fillColor": "#e77148", "color": "#000"
  },
  "maplibre": [
    {
      "type": "circle",
      "filter": ["==", ["geometry-type"], "Point"],
      "paint": {
        "circle-radius": [
          "interpolate", ["linear"], ["zoom"],
          5, 2,
          15, 8
        ],
        "circle-color": [
          "match", ["get", "t_rito"],
          "inumazione", "#5b8def",
          "cremazione", "#e77148",
          "#999"
        ],
        "circle-stroke-color": "#000",
        "circle-stroke-width": 0.5
      }
    }
  ]
}
```

Rules:
- `style.maplibre` is either a single layer-spec object or an array of
  them. An array stacks them in declaration order (`maplibre[0]` is
  bottom-most within the layer).
- `type` is **required** on each entry — MapLibre crashes otherwise.
  Supported types include `circle`, `line`, `fill`, `symbol`, `heatmap`,
  `fill-extrusion`, `hillshade`.
- `paint`, `layout`, `filter`, `minzoom`, `maxzoom` are forwarded as-is
  to MapLibre. See <https://maplibre.org/maplibre-style-spec/layers/>.
- `id` and `source` are **set by the runtime** — don't include them.
- When `style.maplibre` is present, the geometry-typed circle / line /
  fill triple is **not** auto-generated. You're in charge of declaring
  the layers your data needs.

---

## 6. The `detail` block

Drives the per-feature **Details** panel in the sidebar (and, in
`features` layers, the inline lightbox for images). Optional — without
it, clicked features show only their raw properties.

```jsonc
"detail": {
  "title": "tomba",                    // feature.properties key for the heading
  "media": [
    { "kind": "image",    "src": "schizzi/{tomba}.jpg",            "label": "Schizzo" },
    { "kind": "html",     "src": "tombe/Tomba_{tomba}.html",       "label": "Scheda di scavo" },
    { "kind": "download", "src": "tombe/Tomba_{tomba}.docx",       "label": "DOCX" }
  ]
}
```

### `title`

A property key on the feature. The first non-empty value found at
`feature.properties[title]` is used as the heading. Falls back to
`name` / `title` / `nome` / `label` when `detail.title` is absent.

### `media[]`

An ordered list of attachments. Each item:

| Field | Required | Notes |
|---|---|---|
| `kind`  | yes | `image`, `html`, `csv-row`, or `download`. |
| `src`   | yes | Path with `{propname}` placeholders. |
| `label` | no  | Caption / link text. |
| `key`   | csv-row | Column in the CSV to match against. |
| `match` | csv-row | Value to look up (template, e.g. `{tomba}`). Defaults to `{${detail.title}}`. |

Behaviours:

- **`image`** — inline `<img>` (lazy-loaded). Clicking opens a
  full-screen lightbox; Esc / arrows / backdrop close. Images that
  404 are hidden silently (so a 90%-sparse photo catalogue doesn't
  show broken icons).
- **`html`** — fetched as text and rendered through Angular's HTML
  sanitizer in the Details panel. Pandoc-style fragments (tables,
  smallcaps spans, `<em>`) render without a markdown dep. 404s and
  parse errors are hidden.
- **`csv-row`** — fetches a tabular CSV once, indexes it by `key`
  (a column in the CSV), and on each feature select renders the row
  whose key matches `match` (a `{propname}` template against the
  feature properties; defaults to `{${detail.title}}` when omitted).
  Other columns render as a definition list under `label`. When the
  CSV doesn't contain a matching row, the section hides silently —
  same coverage-tolerance as image/html. Use this to join external
  bibliography / metadata tables to map features by ID.
- **`download`** — plain link, opens in a new tab; meant for
  archival attachments like `.docx`, `.pdf`.

### Property interpolation

`{propname}` in `src` is replaced with `String(feature.properties[propname])`.
If any referenced property is missing or empty, the **whole media
item is dropped silently** for that feature — that's how a tomb with
no `schizzo` shows no broken image.

Paths follow the asset-resolution rules in §9.

---

## 7. Basemap (`background` / `backgrounds[]`)

The map shell always draws a single background layer beneath the user
data. Two forms:

### 7.1 Single basemap (`background`)

Shorthand when only one option is wanted.

```jsonc
"background": "osm"                    // alias: osm | ofm | none | false | null
"background": "https://example.org/{z}/{x}/{y}.png"
"background": { "type": "raster-tiled", "conf": { "url": "https://…" } }
"background": false                    // no basemap
```

| Form | Behaviour |
|---|---|
| `false` / `null` / `"none"` | No background layer. |
| Alias string (`"osm"`, `"ofm"`, …) | Maps to the registered tile-provider layer type. |
| HTTPS URL | Treated as a raw `{z}/{x}/{y}` tile template. |
| Object | A full layer descriptor (`type`, `conf`, optional `style`). |

### 7.2 Multiple basemaps with a selector (`backgrounds[]`)

When `backgrounds[]` is present, the sidebar shows a dropdown letting
the user switch among the listed options live. The `background` field,
if set as a string, then names the **default** entry by `id`; if it
doesn't match any entry, the first is used. The single-basemap form
above is ignored when `backgrounds[]` is present.

```jsonc
"backgrounds": [
  { "id": "none", "title": "Nessuno (palude)",
    "type": "background-color",
    "conf": { "color": "#3a4633" } },
  { "id": "osm", "title": "OpenStreetMap",
    "type": "osm-tiled" },
  { "id": "rer-1976", "title": "Aerofoto RER 1976-78",
    "type": "image-overlay",
    "conf": {
      "url": "backgrounds/rer_1976_78.jpg",
      "bounds": [12.1036, 44.6953, 12.1268, 44.7181]
    } }
],
"background": "rer-1976"               // default; optional
```

Each entry is a self-contained layer spec:

| Field | Required | Notes |
|---|---|---|
| `id`    | yes | Stable identifier. Shown in the URL of the future deep-link, used to address the default. |
| `title` | no  | Human-readable label for the selector. Falls back to `id`. |
| `type`  | yes | Registered layer-type name. See catalogue below. |
| `conf`  | type-dependent | Per-type configuration. |
| `style` | no  | Optional renderer-specific style overrides. |

### 7.3 Background layer types

In addition to the tile-based types from §4, two types are designed
for basemap use:

| Type | Renders | `conf` keys |
|---|---|---|
| `background-color` | A solid viewport tint, no source. Used for "no basemap" / context fill. | `color` (hex/CSS), optional `opacity` |
| `image-overlay`    | A single bounded raster image (georeferenced historical map, aerial photo). | `url`, `bounds: [W, S, E, N]` (WGS84), optional `opacity`, `attribution` |
| `raster-tiled` etc. | Any tile provider — same types as for user layers. | `url`, optional `subdomains`, `tileSize`, zoom limits, `attribution` |

`image-overlay` is the right choice for archival captures you've
checked into the repo (extracted from a WMS GetMap, scanned plates,
…). The four-corner extent is in WGS84 decimal degrees, west-south-
east-north order — matches MapLibre's image source corners and
Leaflet's `L.imageOverlay` bounds after the runtime translates them.

---

## 8. Terrain / hillshade (`dem`)

Optional Digital Elevation Model source for hillshade and 3D terrain.
Only honoured by the MapLibre flavour.

```jsonc
"dem": "https://example.org/terrarium/{z}/{x}/{y}.png"
"dem": {
  "url":          "https://…/{z}/{x}/{y}.png",
  "encoding":     "terrarium",         // or "mapbox"
  "hillshade":    true,                // default true
  "terrain":      false,               // 3D terrain
  "exaggeration": 1.0
}
```

A bare URL is shorthand for `{ url, encoding: "terrarium" }`. The
hillshade GL layer is drawn above the basemap and below user layers.

---

## 9. Asset path resolution

Any path that appears in `conf.source`, `detail.media[].src`,
`background.url`, `dem.url`, etc. is run through one rewrite:

| You write | Front-end fetches |
|---|---|
| `https://…` (absolute) | unchanged. |
| `//…` (protocol-relative) | unchanged. |
| `datasets/x.geojson` (bare-relative, in repo mode) | `cdn.jsdelivr.net/gh/<user>/<project>@<ref>/datasets/x.geojson` |
| `/assets/x.csv` (in repo mode) | same — current repo on jsdelivr. |
| `/<otherUser>/<otherProject>[@<ref>]/assets/x.csv` | jsdelivr for **that** repo. Lets one config compose another's data. |
| Anything else (local-asset mode) | resolved against the page URL. |

`<ref>` defaults to `HEAD` (the default branch) and can be set per
load via `?branch=<ref>` on the page URL. The `assets/` segment is
reserved at the workspace root so cross-repo URLs never collide with
GitHub usernames.

---

## 10. jsDelivr URL conventions

For external code that wants to fetch directly:

- `cdn.jsdelivr.net/gh/<user>/<project>@HEAD/<path>` — tip of the
  default branch. **Always include `@HEAD`** (or another ref) — the
  unversioned form requires a GitHub release/tag, and jsDelivr returns
  502 on tagless repos.
- `cdn.jsdelivr.net/gh/<user>/<project>@v1.2/<path>` — pinned tag.
- After publishing a change, hit
  `https://purge.jsdelivr.net/gh/<user>/<project>@<ref>/<path>` to
  invalidate the edge cache.

---

## 11. Worked example

```json
{
  "title": "Valle Trebba",
  "type": "2d",
  "center": [44.702654, 12.121156],
  "minzoom": 1,
  "startzoom": 15,
  "maxzoom": 20,
  "background": "osm",
  "datasources": [
    {
      "name": "graves",
      "type": "geojson+http+remote",
      "conf": { "source": "datasets/punti.geojson" }
    }
  ],
  "layers": [
    {
      "name": "graves",
      "type": "features",
      "datasource": "graves",
      "style": {
        "options": {
          "radius": 4, "fillColor": "#e77148",
          "color": "#000", "weight": 1, "fillOpacity": 0.6
        },
        "maplibre": [
          {
            "type": "circle",
            "filter": ["==", ["geometry-type"], "Point"],
            "paint": {
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 15, 8],
              "circle-color": [
                "match", ["get", "rito"],
                "inumazione", "#5b8def",
                "cremazione", "#e77148",
                "#999"
              ],
              "circle-stroke-color": "#000",
              "circle-stroke-width": 0.5
            }
          }
        ]
      },
      "detail": {
        "title": "tomba",
        "media": [
          { "kind": "image",    "src": "schizzi/{tomba}.jpg",      "label": "Schizzo" },
          { "kind": "html",     "src": "tombe/Tomba_{tomba}.html", "label": "Scheda" },
          { "kind": "csv-row",  "src": "Bibliografia.csv",
            "key": "N. Tomba", "match": "{tomba}",                 "label": "Bibliografia" },
          { "kind": "download", "src": "tombe/Tomba_{tomba}.docx", "label": "DOCX" }
        ]
      }
    }
  ]
}
```

---

## 12. Narrations (`story.json` / `stories.json`)

A GeoContext repo may also carry one or more **narrations**: longform,
scroll-driven articles over the same map, rendered by
[GeoContext Storybook](https://github.com/ohm-geocontext/geocontext-storybook).

Nothing in this document changes. A story is a separate file that
`extends` the `geocontext.json` described here, and adds an ordered list
of blocks — each one able to move the camera, toggle layers, swap the
basemap and carry its own figures.

| File | Meaning |
|---|---|
| `story.json` | A single narration. |
| `stories.json` | An index of several narrations of the same map. |

```jsonc
// stories.json — one map, several readings
{
  "kind": "geocontext-stories",
  "geocontext": "geocontext.json",
  "stories": [
    { "id": "excavation", "path": "stories/excavation.json", "title": "The excavation" },
    { "id": "drainage",   "path": "stories/drainage.json",   "title": "Draining the valley" }
  ]
}
```

The front-end probes for these when it loads a repo and, if either is
present, shows a **Story** / **Stories** link in the masthead. The
narrations link back the same way. Neither file is required, and a repo
without them behaves exactly as before.

The field-by-field reference is
[STORY_FORMAT.md](https://github.com/ohm-geocontext/geocontext-storybook/blob/HEAD/STORY_FORMAT.md).

---

## 13. Versioning

This document is part of the `geocontext-front` repo. Breaking changes
to the schema bump the front-end's `package.json` major version and
land in this file in the same commit. Field additions are
non-breaking; the front-end ignores unknown keys.
