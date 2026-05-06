# GeoContext

> A free, declarative way to publish a map of any public dataset.
> Drop a `geocontext.json` at the root of a public GitHub repo, then open
> `https://www.openhistorymap.org/geocontext-front/<user>/<repo>/map`.
> No fork, no build, no account.

**Live:** <https://www.openhistorymap.org/geocontext-front/>
**Worked example:** <https://www.openhistorymap.org/geocontext-front/Archeolucia/theatres/map>

GeoContext is the engine that powers OpenHistoryMap. It loads a tiny
JSON description from any public GitHub repo (over jsdelivr's CDN), wires
basemaps + data layers + interactivity, and renders an interactive map.
Plugin-driven — every basemap and data format is a small library
contributors can add — and Apache-2.0 licensed.

---

## Quick start

Save this to `geocontext.json` at the **root** of any public GitHub repo:

```json
{
  "title": "My map",
  "center": [44.292, 13.975],
  "startzoom": 5, "minzoom": 1, "maxzoom": 18,
  "background": "osm",
  "datasources": [
    { "name": "places", "type": "geojson+http+remote",
      "conf": { "source": "data/places.geojson" } }
  ],
  "layers": [
    { "name": "Places", "type": "features", "datasource": "places",
      "style": { "options": { "radius": 4, "fillColor": "#9448b7",
                              "color": "#000", "weight": 1, "fillOpacity": 0.6 } } }
  ]
}
```

Add `data/places.geojson` next to it. Then open:

```
https://www.openhistorymap.org/geocontext-front/<user>/<repo>/map
```

That's it. Updates to the repo propagate as jsdelivr's cache rolls over
(usually minutes; force a specific commit with `?branch=<sha>`).

**Want a different file or branch?**

```
…/map?branch=main                       # not the default branch
…/map?path=charts/election-2024.json    # not /geocontext.json
```

The legacy filename `gcx.json` is also accepted as a fallback.

---

## What goes in `geocontext.json`

| Field | Type | Notes |
|---|---|---|
| `title` | string | Page + masthead title. |
| `center` | `[lat, lon]` *or* `{ lat, lon }` | Initial map centre. Latitude first (everyday "44°N 13°E" order). |
| `startzoom` / `minzoom` / `maxzoom` | number | Initial zoom + interaction limits. |
| `background` | string \| object | Basemap layer — see *Background basemap* below. Optional. |
| `dem` | string \| object | Digital Elevation Model source — see *Terrain & hillshade* below. Optional. |
| `datasources` | array | Named data sources fetched at load — see *datasource types* below. |
| `layers` | array | Layers stacked on the map (top of array = top of stack) — see *layer types* below. |

### Built-in layer types

| `type` | What it draws |
|---|---|
| `raster-tiled` | Generic XYZ raster tile layer. `conf.url` is the template (`{z}/{x}/{y}` or `{s}` for subdomains). Use this when no dedicated provider library exists. |
| `raster-dem` | Elevation raster (terrarium / mapbox-rgb). Renders hillshade and (optionally) 3D terrain on the MapLibre flavour; ignored on Leaflet. |
| `osm-tiled` | OpenStreetMap raster tiles. No `datasource` needed. |
| `ofm-tiled` | OpenFantasyMaps render server. |
| `carto-voyager` · `carto-light` · `carto-dark` · `carto-positron` (and matching `*-nolabels`) | CARTO basemap variants. |
| `features` | Renders a datasource's GeoJSON as styled markers / lines / polygons. Pair with a `style.options` block (`radius`, `fillColor`, `color`, `weight`, `opacity`, `fillOpacity`). |
| `geomqtt` | Subscribes to an MQTT broker and pushes incoming GeoJSON features onto the map live. `conf` requires `broker` (ws/wss URL) and `topic`; optional `idField`, `maxFeatures`. (Currently Leaflet-only — see *known gaps*.) |

If `geocontext.json` declares no `background` (and no tile layer in
`layers[]`), the MapLibre flavour falls back to its default OpenFreeMap
"bright" style so the canvas isn't empty. The Leaflet flavour does not —
declare a `background` (or any tile layer) when targeting Leaflet.

### Background basemap

`background` is a shorthand for declaring a single basemap layer
without spelling out a `layers[]` entry. Accepted forms:

```json
{ "background": "osm" }                                            // built-in alias
{ "background": "ofm" }                                            // OpenFantasyMaps
{ "background": "carto-voyager" }                                  // any registered tile-layer type
{ "background": "https://tile.example.org/{z}/{x}/{y}.png" }       // raw URL
{ "background": {
    "url": "https://{s}.tile.example.org/{z}/{x}/{y}.png",
    "subdomains": "abc",
    "attribution": "© Example",
    "maxZoom": 19
  } }
{ "background": { "type": "osm-tiled", "conf": { "url": "https://my-mirror/{z}/{x}/{y}.png" } } }
{ "background": "none" }                                           // suppress any default
```

The resolved background sits at the **bottom** of the visual stack
(below `layers[]` and `dem`) and shows up at the bottom of the sidebar
list, where the user can toggle it off like any other layer.

### Terrain & hillshade

`dem` registers a Digital Elevation Model raster source. The MapLibre
flavour turns it into a hillshade GL layer and (optionally) 3D terrain;
the Leaflet flavour ignores it with a warning.

```json
{
  "dem": {
    "url": "https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png",
    "encoding": "terrarium",
    "hillshade": true,
    "terrain": true,
    "exaggeration": 1.4,
    "attribution": "© Mapzen / AWS Terrain Tiles"
  }
}
```

| Field | Default | Notes |
|---|---|---|
| `url` | — | Tile template. `{z}/{x}/{y}` (and `{s}` with `subdomains`) supported. |
| `encoding` | `"terrarium"` | Pixel encoding scheme. `"terrarium"` (Mapzen / AWS) or `"mapbox"` (terrain-rgb). |
| `hillshade` | `true` | Render a hillshade GL layer. Set `false` to register the source for terrain only. |
| `terrain` | `false` | Enable 3D terrain (`map.setTerrain`). MapLibre only. |
| `exaggeration` | `1` | Vertical exaggeration when `terrain: true`. |
| `minZoom` / `maxZoom` | — | Zoom bounds for the source. |

A bare URL string is shorthand for `{ url, encoding: "terrarium",
hillshade: true }`:

```json
{ "dem": "https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png" }
```

#### Worked example: Mediterranean relief over OSM

```json
{
  "title": "Adriatic terrain",
  "center": [43.5, 14.5],
  "startzoom": 6,
  "background": "carto-positron",
  "dem": {
    "url": "https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png",
    "encoding": "terrarium",
    "hillshade": true,
    "terrain": true,
    "exaggeration": 1.2
  },
  "datasources": [],
  "layers": []
}
```

### Built-in datasource types

| `type` | What it does |
|---|---|
| `geojson` | Inline GeoJSON in `conf.data`. |
| `geojson+http+remote` | Fetches a GeoJSON file at `conf.source`. |
| `csv+http+remote` | Fetches a CSV at `conf.source` and projects rows as Points. Requires `conf.structure[]` with one column tagged `gcx:lat` and one tagged `gcx:lon`. |
| `csv` | Inline CSV string in `conf.data`. |

#### CSV with tagged columns (example)

```json
{
  "name": "stations",
  "type": "csv+http+remote",
  "conf": {
    "source": "data/stations.csv",
    "structure": [
      { "column": "name",       "type": "string", "tags": ["gcx:title"] },
      { "column": "longitude",  "type": "number", "tags": ["gcx:lon", "gcx:geo"] },
      { "column": "latitude",   "type": "number", "tags": ["gcx:lat", "gcx:geo"] }
    ]
  }
}
```

### How asset URLs resolve

`datasources[*].conf.source` (and similar paths inside the config) is
rewritten by GeoContext so configs stay short and portable:

| You write | GeoContext fetches |
|---|---|
| `https://example.org/x.csv` *(absolute)* | unchanged. |
| `data/places.geojson` *(bare relative)* | `https://cdn.jsdelivr.net/gh/<user>/<repo>@HEAD/data/places.geojson` — the current repo on jsdelivr. |
| `/assets/about.html` | same — current repo, jsdelivr. |
| `/<otherUser>/<otherRepo>/assets/x.csv` | jsdelivr for **that** repo. Lets one repo's config compose another's data. Optional `@<branch>` after the project. |

`assets` is reserved at the workspace root, so cross-repo asset URLs
never collide with usernames.

---

## Static pages alongside the map

A repo can also ship `geocontext-static.json` (legacy filename
`chcx-static.json` is accepted) — a registry of prose pages: about,
methodology, sources, citations. They appear in the masthead and live at
`/<user>/<repo>/static/<slug>`.

```json
{
  "about": {
    "target": "about", "title": "About", "icon": "info",
    "mode": "file", "content": "docs/about.html"
  },
  "sources": {
    "target": "sources", "title": "Sources",
    "mode": "raw", "content": "<p>Compiled from …</p>"
  }
}
```

`mode: "file"` HTML paths resolve through the same asset rules as
datasources; `mode: "raw"` accepts inline HTML.

---

## Embed the engine in your own app

Every library is published to **GitHub Packages** under
`@openhistorymap/*`. Add a `.npmrc` (any GitHub token with
`read:packages` works for these public packages):

```
@openhistorymap:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install whichever pieces you need:

```bash
npm install @openhistorymap/gcx-core \
            @openhistorymap/mn-geo \
            @openhistorymap/mn-geo-layers \
            @openhistorymap/mn-geo-datasources \
            @openhistorymap/mn-geo-flavours-mapbox \
            @openhistorymap/mn-geo-layers-osm
```

Register the layer + datasource plugins you want at bootstrap:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideMnGeoLayersFeature } from '@openhistorymap/mn-geo-layers';
import { provideMnGeoDatasourcesGeojson } from '@openhistorymap/mn-geo-datasources';
import { provideMnGeoLayersOsm } from '@openhistorymap/mn-geo-layers-osm';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAnimationsAsync(),
    provideMnGeoLayersFeature(),
    provideMnGeoDatasourcesGeojson(),
    provideMnGeoLayersOsm(),
    /* add provideMnGeoLayersOfm(), provideMnGeoLayersCarto(),
       provideMnGeoLayersGeomqtt(), provideMnGeoDatasourcesCsv(), … */
  ],
};
```

And drop `<gcx-map>` (with a rendering flavour child) into a route
component — or compose `<mn-map>` directly if you don't want the
Material drawer shell:

```html
<gcx-map>
  <div mnMapFlavourMaplibre></div>
  <!-- swap to [mnMapFlavourLeaflet] if you need geomqtt -->
</gcx-map>
```

`<gcx-map>` reads its config from `GcxCoreService.load(...)` — call it
with a `{ user, project }` repo descriptor to mirror the public service,
or with a URL string to load a local `gcx.json`.

---

## Architecture, in one paragraph

`<mn-map>` is a declarative container. It picks up a rendering **flavour**
(MapLibre-GL by default; Leaflet available) from a `[mnMapFlavour*]`
directive among its content. **Datasources** fetch data; **layers** read
that data and emit renderer-agnostic descriptors (`raster-tiles`,
`vector-tiles`, `geojson-features`); the active flavour translates each
descriptor into its native form (a Leaflet layer, a MapLibre source +
style layer, etc.). Layers and datasources self-register as plugins via
`provideAppInitializer` factories — adding a new tile source or data
format is a small standalone library, not a fork.

Full state, porting notes, and contributor guidance in
[`CLAUDE.md`](./CLAUDE.md).

---

## Contributing

The most useful contributions are usually new layer or datasource types:

1. Scaffold a library: `ng g library mn-geo-layers-<your-name>` (or
   `mn-geo-datasources-<your-name>`).
2. Implement the `Layer` (or `Datasource`) abstract from
   `@openhistorymap/mn-geo-layers` (resp. `mn-geo-datasources`). Layers
   should emit one of the renderer-agnostic descriptors so they work on
   every flavour.
3. Export a `provideMnGeoLayers<YourName>()` factory that registers your
   class with `MnGeoLayersRegistryService` via `provideAppInitializer`.
4. Add the lib to `scripts/build-ported.sh` and the publish workflow.

Worked examples in `projects/mn-geo-layers-osm/`,
`projects/mn-geo-layers-ofm/`, and the live-data
`projects/mn-geo-layers-geomqtt/` (which also shows the descriptor
`subscribe?` channel for streaming sources).

Issues and PRs welcome.

---

## Status & known gaps

Currently shipping from the `rewrite/angular-latest` branch (Angular
19 / standalone), which has surpassed the legacy `master` and is on
its way to becoming the default branch.

- ✅ Map composition, OSM / OFM / CARTO basemaps, GeoJSON + CSV
  datasources, FeatureLayer, GeoMQTT live streams, `chcx-static`
  pages, repo-driven `/<user>/<repo>/map` and `/.../static/<slug>` views.
- ⏳ MapLibre-only descriptor for `geomqtt` (currently Leaflet-only).
- ⏳ Other legacy libraries (`mn-geo-datasources-shp`, `-agentmap`,
  `mn-geo-layers-ohm`, `c3d-core`, …) not yet ported. See `CLAUDE.md`.

---

## Built in Bologna

GeoContext is built and maintained by
[OpenHistoryMap](https://www.openhistorymap.org). Apache-2.0 — see
[`LICENSE`](./LICENSE).
