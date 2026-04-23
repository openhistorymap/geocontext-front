# GeoContext

GeoContext is a declarative, plugin-driven map application built on Angular 19.
A single `<mn-map>` element composes a rendering **flavour** (MapLibre GL by
default, Leaflet available), any number of **layers** (OSM, OpenFantasyMaps,
GeoMQTT live streams, …), and **datasources** (CSV, GeoJSON, SHP, …). Layer
classes emit renderer-agnostic descriptors (`raster-tiles`, `vector-tiles`,
`geojson-features`); flavours translate descriptors into their native
representations. Layers and datasources come from their own libraries and
self-register at bootstrap, so adding a new backend is one provider call,
not a fork of the core.

The repository is an Angular CLI monorepo: one shell app (`geocontext-front`),
two secondary apps (`cityos-ng`, `ohm-front`), and ~25 libraries published
under `@modalnodes/*`, `@geocontext/*`, and `@ohmap/*`.

## Layout

```
src/                       app (geocontext-front)
projects/
  mn-registry/             plugin registry services
  mn-geo/                  <mn-map> + flavour interface + projected children
  mn-geo-datasources/      Datasource / RemoteHttpDatasource + manager
  mn-geo-layers/           Layer abstract + manager + registry
  mn-geo-layers-osm/       OSM tile layer   (provideMnGeoLayersOsm)
  mn-geo-layers-ofm/       OpenFantasyMaps  (provideMnGeoLayersOfm)
  mn-geo-layers-geomqtt/   MQTT → GeoJSON live stream
  mn-geo-flavours-leaflet/ Leaflet adapter ([mnMapFlavourLeaflet])
  mn-geo-flavours-mapbox/  MapLibre-GL adapter ([mnMapFlavourMaplibre]; lib
                           name kept for npm stability)
  gcx-core/                Material shell: toolbar + sidebar + router-outlet
  chcx-static/             static-page route list
  …                        see angular.json for the full set
public/assets/gcx.json     runtime map config (center, datasources, layers)
_legacy/                   frozen Angular 6 tree, kept while porting
```

Libraries resolve from `dist/<name>/` via `tsconfig.json` `paths`, so a
library must be built before a consumer can import it.

## Toolchain

- Angular 19.2, TypeScript 5.7, RxJS 7.8, zone.js 0.15, esbuild application
  builder, Material 19.
- **Node 20 required, via Docker.** The host's GLIBC (Ubuntu 18.04-era) can't
  run Node 18+ binaries, so nvm isn't an option. Every command below runs
  inside `node:20` with the repo mounted.

```bash
# Install dependencies (first time, and after package.json changes)
docker run --rm -v "$PWD:/app" -w /app -u $(id -u):$(id -g) \
  -e HOME=/tmp -e NG_CLI_ANALYTICS=false node:20 \
  npm install

# Dev server (http://localhost:4200)
docker run --rm -v "$PWD:/app" -w /app -u $(id -u):$(id -g) \
  -p 4200:4200 -e HOME=/tmp node:20 \
  npx ng serve --host=0.0.0.0

# Build a single library (rebuild downstream libs after changes)
docker run --rm -v "$PWD:/app" -w /app -u $(id -u):$(id -g) \
  -e HOME=/tmp node:20 \
  npx ng build <lib-name>

# Build the main app (production)
docker run --rm -v "$PWD:/app" -w /app -u $(id -u):$(id -g) \
  -e HOME=/tmp node:20 \
  npx ng build

# Per-project unit tests / lint
docker run --rm -v "$PWD:/app" -w /app -u $(id -u):$(id -g) \
  -e HOME=/tmp node:20 \
  npx ng test <project>
```

## How a map is composed

Runtime config in `public/assets/gcx.json`:

```json
{
  "title": "GeoContext",
  "center": [12.4964, 41.9028],
  "startzoom": 5, "minzoom": 1, "maxzoom": 19,
  "datasources": [],
  "layers": [
    { "name": "OpenStreetMap", "type": "osm-tiled" }
  ]
}
```

The shell reads that file, feeds the center + zoom into `<mn-map>`, and
projects each `layers[*]` entry as a `<mn-layer>` whose `type` is looked up
in the `MnGeoLayersRegistryService`. The registry is populated at bootstrap
by `provideMnGeoLayersOsm()`, `provideMnGeoLayersOfm()`, etc. in
`src/app/app.config.ts` — adding a layer source is a one-line provider call.

The rendering backend is chosen by which flavour directive is placed inside
`<gcx-map>`:

```html
<gcx-map>
  <div mnMapFlavourMaplibre></div>  <!-- or [mnMapFlavourLeaflet] -->
</gcx-map>
```

`gcx-core` stays renderer-agnostic — swapping MapLibre for Leaflet is a
change in the app's `MapRouteComponent`, not in `gcx-map`. The default
`MapRouteComponent` uses MapLibre; switch to Leaflet if you need `geomqtt`
live-stream layers (those still emit native Leaflet objects until we
descriptor-ify them).

## Rewrite status

This branch (`rewrite/angular-latest`) is a ground-up port of the original
Angular 6 monorepo. The plugin architecture is preserved; the module system
is standalone; registration side-effects moved from NgModule constructors to
`provideAppInitializer()` functions.

**Ported:** `mn-registry`, `mn-geo-{datasources,layers}`, `mn-geo`,
`mn-geo-flavours-leaflet`, `mn-geo-flavours-mapbox` (MapLibre-GL inside),
`mn-geo-layers-osm`, `mn-geo-layers-ofm`, `mn-geo-layers-geomqtt`,
`gcx-core`.

**Not yet ported:** the remaining datasource/layer libraries (`-csv`,
`-shp`, `-agentmap`, `-carto`, `-ohm`, `-c3d`), `chcx-static` routes,
`chcx-main`, `chcx-about`, `ohm-core`, `c3d-core`, and the two secondary
apps (`cityos-ng`, `ohm-front`). GeoMQTT's descriptor-emission also
pending — it's Leaflet-only for now.

**Dropped:** Stamen (service deprecated 2023), the modes / transformer
matrix libraries (empty scaffolds in legacy), `angularfire2` / Firebase
(not needed), `@angular/flex-layout` (deprecated), Protractor (EOL).

See `_legacy/` for the original Angular 6 source and `CLAUDE.md` for porting
notes.

## License

See `LICENSE`.
