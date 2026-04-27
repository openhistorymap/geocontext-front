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
| `datasources` | array | Named data sources fetched at load — see *datasource types* below. |
| `layers` | array | Layers stacked on the map (top of array = top of stack) — see *layer types* below. |

### Built-in layer types

| `type` | What it draws |
|---|---|
| `osm-tiled` | OpenStreetMap raster tiles. No `datasource` needed. |
| `ofm-tiled` | OpenFantasyMaps render server. |
| `carto-voyager` · `carto-light` · `carto-dark` · `carto-positron` (and matching `*-nolabels`) | CARTO basemap variants. |
| `features` | Renders a datasource's GeoJSON as styled markers / lines / polygons. Pair with a `style.options` block (`radius`, `fillColor`, `color`, `weight`, `opacity`, `fillOpacity`). |
| `geomqtt` | Subscribes to an MQTT broker and pushes incoming GeoJSON features onto the map live. `conf` requires `broker` (ws/wss URL) and `topic`; optional `idField`, `maxFeatures`. (Currently Leaflet-only — see *known gaps*.) |

If `geocontext.json` declares only feature layers, GeoContext shows a
default OSM raster behind them so the canvas isn't empty.

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
