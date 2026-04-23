# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state: mid-rewrite

This branch (`rewrite/angular-latest`) is a ground-up rewrite of the legacy Angular 6 app onto **Angular 19**. The foundation is ported and the app builds end-to-end; the remaining work is porting the long tail of datasource/layer/shell libraries from `_legacy/`.

### Rewrite progress

Done:
- [x] Relocate Angular 6 source to `_legacy/`
- [x] Scaffold Angular 19 workspace (standalone, SCSS, strict TS 5.7)
- [x] Scaffold libraries (38 originals → 25 after pruning empty scaffolds) + 2 secondary apps
- [x] Scoped package names (`@modalnodes/*`, `@geocontext/*`, `@ohmap/*`) and `tsconfig.json` paths
- [x] Pick + install runtime deps (Material 19, maplibre-gl 5, leaflet 1.9, turf 7, papaparse 5, mqtt 5, `datamodel` 2.0.2 remote)
- [x] Port `mn-registry` (new lib — replaces the external `@modalnodes/mn-registry` package, which was Angular 6-only)
- [x] Port `mn-geo-datasources` cores: `Datasource`, `RemoteHttpDatasource`, `DatasourcesmanagerService`, both registries
- [x] Port `mn-geo-layers` cores: `Layer` abstract, `LayersmanagerService`, `MnGeoLayersRegistryService`
- [x] Port `mn-geo` container: `<mn-map>`, `<mn-layer>`, `<mn-datasource>`, `<mn-style>`, `MnMapFlavourDirective`, `DatasetRegistryService`
- [x] Port `mn-geo-flavours-leaflet`: real Leaflet adapter (was an empty stub in legacy)
- [x] Port `mn-geo-layers-osm`: OSM tile classes + `provideMnGeoLayersOsm()`
- [x] New `mn-geo-layers-ofm`: OpenFantasyMaps tiles + `provideMnGeoLayersOfm()`
- [x] New `mn-geo-layers-geomqtt`: MQTT → GeoJSON live streams + `provideMnGeoLayersGeomqtt()`
- [x] Port `gcx-core` Material shell: `<gcx-main>` toolbar + router-outlet, `<gcx-map>` mat-drawer + `<mn-map>` composition, path routing (not hash)
- [x] App wiring: `AppComponent` hosts `<gcx-main>`, `MapRouteComponent` chooses the flavour (Leaflet), `provideMnGeoLayers{Osm,Ofm,Geomqtt}()` in `app.config`
- [x] README rewritten, CI via `.github/workflows/{ci,docker}.yml`, `Dockerfile.geocontext-front` updated for the `browser/` output directory, `.travis.yml` removed

Dropped (were empty scaffolds in legacy or dead-service):
- ~~Stamen~~ (tile service retired 2023)
- ~~Modes~~ (`mn-geo-modes-{m2d,m25d,m3d}`) — empty scaffolds
- ~~Transformers~~ (7 libraries of the `(layer × mode × flavour)` matrix) — empty scaffolds
- ~~Firebase / `angularfire2`~~ — not needed
- ~~`@angular/flex-layout`~~ — deprecated; plain CSS instead
- ~~`@thisissoon/angular-inviewport`~~ — dead since Angular 8; use `IntersectionObserver` directly

Not yet ported (stock `ng g library` scaffolds, do not treat as real code):
- [ ] `mn-geo-datasources-{csv,firebase,shp,agentmap}` (firebase will stay empty — dep dropped)
- [ ] `mn-geo-layers-{carto,ohm,c3d}`
- [ ] `mn-geo-flavours-mapbox` (the lib name stays; implementation should be MapLibre-GL)
- [ ] `mn-map` (standalone Leaflet host), `mn-mapgl` (standalone MapLibre host)
- [ ] `mn-caching`, `mn-lazy`, `mn-filesize`
- [ ] `chcx-static` (dynamic routes from `/assets/chcx-static.json`), `chcx-main`, `chcx-about`
- [ ] `ohm-core`, `c3d-core`
- [ ] Secondary apps: `cityos-ng`, `ohm-front`
- [ ] FeatureLayer + GeoJsonDatasource (the missing pieces for rendering CSV/GeoJSON data)

Idioms to apply during remaining ports:
- `NgModule` → standalone
- Constructor injection → `inject()`
- `@Input`/`@Output` → `input()` / `output()` signals (keep `EventEmitter` where it's observed externally)
- NgModule constructor registration side-effects → `provideAppInitializer(() => { inject(Registry).register(...) })` factory exported as `provideMnGeo<X>()`
- `@angular/http` → `HttpClient` from `@angular/common/http`
- `toPromise()` → `firstValueFrom()` from `rxjs`
- Hash routing → path routing

## Toolchain constraint: host GLIBC is too old

This host runs Ubuntu 18.04 with pre-2.28 GLIBC. **Node 18+ binaries won't execute**, which blocks Angular 18+ CLI on the host. Work around with Docker, mounting the repo:

```bash
docker run --rm -v "$PWD:/app" -w /app -u $(id -u):$(id -g) \
  -e HOME=/tmp -e NG_CLI_ANALYTICS=false \
  node:20 <command>
```

Never run `nvm install` on the host for Node 18/20 — the binary won't start.

## Stack

Angular 19.2, TypeScript 5.7, RxJS 7.8, zone.js 0.15, Angular Material 19 (azure-blue prebuilt theme), esbuild application builder, strict TS, SCSS. Karma/Jasmine for tests (scaffolded, not wired). No SSR.

## Repository layout

- `src/` — application `geocontext-front`. `AppComponent` renders `<gcx-main>`; routes resolve to `MapRouteComponent`, which wraps `<gcx-map>` with the chosen flavour.
- `projects/` — libraries + two secondary apps (`cityos-ng`, `ohm-front`).
- `public/assets/gcx.json` + `chcx-static.json` — runtime config (Angular 19 moved static assets from `src/assets/` to `public/`).
- `_legacy/` — the entire Angular 6 workspace, read-only reference material. Delete once porting is done.
- `tsconfig.json` `paths` — map each `@modalnodes/*`, `@geocontext/*`, `@ohmap/*` import to `./dist/<lib>`. Libraries still resolve from `dist/`, so a library must be built before any consumer can import it.

## Commands

All commands run inside `node:20` via Docker (see toolchain note). `npx ng ...` works inside the container without a local install.

```bash
# First install, and after package.json changes
docker run --rm -v "$PWD:/app" -w /app -u $(id -u):$(id -g) \
  -e HOME=/tmp node:20 npm install

# Dev server
docker run --rm -v "$PWD:/app" -w /app -u $(id -u):$(id -g) \
  -p 4200:4200 -e HOME=/tmp node:20 \
  npx ng serve --host=0.0.0.0

# Build a single library (rebuild downstream libs after changes)
npx ng build <lib-name>

# Build the app
npx ng build

# Per-project tests / lint
npx ng test <project>
npx ng lint <project>
```

## Architecture

### Plugin / registry pattern

`MnRegistryService<T>` holds keyed classes/values; subclasses override `for(name)` to transform on read (e.g. instantiate a class, wire HTTP). `MnMetaRegistryService` is the registry of registries — lookup by name, key, or tag. Everything self-registers in constructors of `providedIn: 'root'` services, so the wiring is done before any component needs it.

Layer/datasource **types** are registered via provider functions at bootstrap:

```typescript
// app.config.ts
providers: [
  provideMnGeoLayersOsm(),
  provideMnGeoLayersOfm(),
  provideMnGeoLayersGeomqtt(),
  // …
]
```

Each provider uses `provideAppInitializer(() => { inject(MnGeoLayersRegistryService).register(...) })`. Replacing an NgModule constructor side-effect with this one-liner is the stock recipe when porting a legacy `register('name', FooLayer)` call.

### Map composition model

`<mn-map>` (`projects/mn-geo/src/lib/mn-map/mn-map.component.ts`) is a declarative container:

- Projects one `[mnMapFlavour]` child (the renderer adapter; currently only `[mnMapFlavourLeaflet]`), plus any `<mn-layer>` / `<mn-datasource>` / `<mn-style>` children.
- `ngAfterContentInit` picks the first flavour from `contentChildren(MnMapFlavourDirective, { descendants: true })` and calls `flavour.setup(this)`.
- The flavour's `setup` creates the underlying map (Leaflet/MapLibre/…) and calls back `host.ready()`, which feeds the collected datasources and layers into `DatasourcesmanagerService` / `LayersmanagerService`. The layers manager defers layers that require datasources until `DatasourcesmanagerService.fetchDatasources()` resolves.

Adding a new rendering backend is a new `mn-geo-flavours-*` library; `mn-geo` does not need to change. The `[mnMapFlavourLeaflet]` directive uses `providers: [{ provide: MnMapFlavourDirective, useExisting: forwardRef(...) }]` so `<mn-map>`'s `contentChildren(MnMapFlavourDirective)` picks it up.

### Application shell (`gcx-core`)

- `<gcx-main>` — MatToolbar (menu, title, `Map` + dynamic static-page links from `GcxRouteItem[]`) + `<router-outlet>` + footer. `:host` is a flex column filling the viewport.
- `<gcx-map>` — mat-drawer-container with tabs (Layers / Info) on the left, `<mn-map>` on the right. Reads config via `GcxCoreService.load()` (HTTP-loaded `/assets/gcx.json`, cached). Content-projects a flavour directive into `<mn-map>` so **`gcx-map` is renderer-agnostic**.
- `GcxCoreService` — `load()` + `getConf()` for config, `sidebarOpen` signal for toggle state.
- `GCX_ROUTES` — `''` redirects to `map`; `map` → `GcxMapComponent`. **Path routing, not hash.** Consumers may override by building their own `Routes` and passing to `provideRouter()`.

Runtime map configuration lives in `public/assets/gcx.json` (plus referenced CSVs/GeoJSONs under `public/assets/datasets/` when those get migrated). **Keep this contract stable during remaining ports** so existing JSON configs still load.

## Packaging / deploy

- `Dockerfile.geocontext-front` is `nginx:alpine` copying `dist/geocontext-front/browser/` (Angular 19 application builder nests its output under `browser/`).
- `.github/workflows/ci.yml` runs on push/PR, installs deps, builds each ported library in order, then the app, and uploads dist as an artifact.
- `.github/workflows/docker.yml` runs on master and tags, builds + pushes `modalnodes/geocontext-front` to Docker Hub when secrets `DOCKER_USERNAME` / `DOCKER_PASSWORD` are set; uses `docker/setup-buildx-action` with GHA layer cache.
- `.travis.yml` removed.
