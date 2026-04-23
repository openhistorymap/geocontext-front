# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state: mid-rewrite

This branch (`rewrite/angular-latest`) is a ground-up rewrite of the legacy Angular 6 app onto **Angular 19**. The skeleton is scaffolded; **no library or app code has been ported yet** — every `projects/*` library and every app is a stock `ng g` scaffold with the default `*.component.ts`/`*.service.ts`. Run a checkout of `master` or look under `_legacy/` for the original source.

**Do not treat the scaffolded components as real code.** They're placeholders whose only purpose is to own the name, prefix, and scoped `package.json` for each library.

### Rewrite progress

- [x] Relocate Angular 6 source to `_legacy/`
- [x] Scaffold Angular 19 workspace at root (`ng new`, standalone, SCSS, strict TS)
- [x] Scaffold 38 libraries + 2 additional apps (`cityos-ng`, `ohm-front`) with original naming
- [x] Restore scoped package names (`@modalnodes/*`, `@geocontext/*`, `@ohmap/*`) and `tsconfig.json` paths
- [ ] `npm install` — not run yet; no lockfile committed
- [ ] Add third-party runtime deps (leaflet, maplibre-gl/mapbox-gl, @angular/material, @angular/fire, @turf/turf, papaparse, …)
- [ ] Port `mn-geo` core: `<mn-map>` composition model, `MnGeoFlavour` interface, `DatasourcesmanagerService`, `LayersmanagerService`, registry pattern
- [ ] Port datasource libs (`-csv`, `-firebase`, `-shp`, `-agentmap`)
- [ ] Port layer libs (`-osm`, `-stamen`, `-carto`, `-ohm`, `-c3d`)
- [ ] Port flavour libs (`-leaflet`, `-mapbox`) — Angular 19 equivalents of the renderer adapters
- [ ] Port mode/transformer libs
- [ ] Port `gcx-core` shell and `chcx-static` routes
- [ ] Preserve the runtime config contract: `src/assets/gcx.json`, `src/assets/chcx-static.json`

Map legacy → modern idioms during the port:
- `NgModule` → standalone components
- Constructor injection → `inject()`
- `EventEmitter` + `@Output` → signals + `output()` where practical
- RxJS 6 → 7 (`pipe()` stays, but `toPromise()` → `firstValueFrom`, `rxjs/operators` moved into `rxjs`)
- `@angular/http` → `HttpClient` (from `@angular/common/http`)
- `@angular/flex-layout` → CSS flex/grid (package deprecated)
- `angularfire2` + `firebase@5` → `@angular/fire` 18 + modular `firebase@10`
- Protractor e2e → Playwright (or skip — not scaffolded yet)

## Toolchain constraint: host GLIBC is too old

This host runs Ubuntu 18.04 with pre-2.28 GLIBC. **Node 18+ binaries won't execute**, which blocks Angular 18+ CLI on the host. Work around with Docker, mounting the repo:

```bash
docker run --rm -v "$PWD:/app" -w /app -u $(id -u):$(id -g) \
  -e HOME=/tmp -e NG_CLI_ANALYTICS=false \
  node:20 <command>
```

Never run `nvm install` on the host for Node 18/20 — the binary won't start.

## Stack

Angular 19.2, TypeScript 5.7, RxJS 7.8, zone.js 0.15, strict TS, SCSS styles, application builder (esbuild). Karma/Jasmine for tests (scaffolded; not yet wired). No SSR.

## Repository layout

- `src/` — application `geocontext-front`.
- `projects/` — 38 libraries + 2 additional apps (`cityos-ng`, `ohm-front`). Libraries publish as scoped packages; apps do not.
- `_legacy/` — the entire Angular 6 workspace, preserved for reference during the port. **Do not modify** — it's read-only source material. It will be deleted in a final commit once porting is complete.
- `tsconfig.json` `paths` — map each `@modalnodes/*`, `@geocontext/*`, `@ohmap/*` import to `./dist/<lib>`. Libraries still resolve from `dist/`, so a library must be built before any consumer can import it.
- Root keeps Firebase config (`firebase.json`, `.firebaserc`, `database.rules.json`, `storage.rules`, `.firebase/`), Docker files (`Dockerfile.geocontext-front`, `docker-compose.geocontext-front.yaml`, `docker-entrypoint.sh`), `.travis.yml`, and `.npmrc.template`. These all need a pass when the rewrite stabilises — Dockerfile still builds from `dist/geocontext-front/`, which works, but `.travis.yml` pins Node 9 and runs the defunct `build_em_all.sh`.

## Commands

All commands run inside `node:20` (see constraint above). Inside the container, `npx ng ...` works without a local install.

```bash
# From the host
docker run --rm -v "$PWD:/app" -w /app -u $(id -u):$(id -g) \
  -e HOME=/tmp -e NG_CLI_ANALYTICS=false node:20 \
  sh -c 'npm install'                    # first time

# Dev server
docker run --rm -v "$PWD:/app" -w /app -u $(id -u):$(id -g) \
  -p 4200:4200 -e HOME=/tmp node:20 \
  npx ng serve --host=0.0.0.0

# Build a single library (must build before anything importing it)
npx ng build <lib-name>

# Build everything (apps pull transitively from dist/)
npx ng build

# Per-project tests / lint
npx ng test <project>
npx ng lint <project>
```

`package.json` at root has only `ng`/`start`/`build`/`watch`/`test` scripts. There is intentionally no `build_em_all.sh` equivalent yet — add one once dependency order between libraries is re-established.

## Architecture (post-rewrite target)

Same shape as legacy, modernised. The rewrite should preserve these contracts because they shape runtime configuration and user expectations:

### Plugin / registry pattern

Cross-cutting services extend `MnRegistryService` from `@modalnodes/mn-registry` and self-register in `MnMetaRegistryService` under a name + tags. New flavours/layers/datasources/modes are discovered by registry lookup at runtime, not by direct import. In the rewrite, register in the library's `providers` (standalone) or a root-provided service rather than an `NgModule` constructor.

### Map composition model

`<mn-map>` is a declarative container that:

- Projects child `<mn-layer>` / `<mn-datasource>` components and one `[mnMapFlavour]` directive child.
- Picks the first flavour (a class implementing `MnGeoFlavour` with `setup/addLayer/removeLayer/addDatasource/removeDatasource`) and hands itself to `flavour.setup(this)`. The flavour is the Leaflet/Mapbox-GL adapter.
- Wires `DatasourcesmanagerService` and `LayersmanagerService` bidirectionally; on `ready()` projects children through them.

Adding rendering support for a new map library = implement `MnGeoFlavour` in a new `mn-geo-flavours-*` library + the matching `mn-geo-transformers-*-<flavour>` bindings. Do **not** modify `mn-geo`.

### Application shell (`gcx-core`)

- `GcxMainComponent` (`<gcx-main>`) is the toolbar + sidebar + router-outlet shell consumed by `src/app/app.component.html`.
- Routes: `''` → `GcxMainComponent`, `map` → `GcxMapComponent` (legacy used hash routing; modernise to path-based unless there's a reason to keep hash).
- `GcxCoreService.getConf()` reads `/assets/gcx.json` via `MnConfiguratorService`. When `<gcx-main [autoload]="true">`, the shell pulls `title/center/startzoom/minzoom/maxzoom` from that file; `<gcx-map>` reads `datasources` and `layers` from the same file.
- `chcx-static` exposes `/assets/chcx-static.json` as a route list; `src/app/app.component.html` injects these into `<gcx-main [items]="chcxStatic.getRoutes()">`.

Runtime map configuration lives in `src/assets/gcx.json` (plus referenced CSVs/GeoJSONs under `src/assets/datasets/`), not in code. Keep this contract stable during the rewrite so existing JSON configs still load.

## Packaging / deploy

- `Dockerfile.geocontext-front` is a plain `nginx:alpine` that copies `dist/geocontext-front/` into `/usr/share/nginx/html`. Output path is now `dist/geocontext-front/browser/` under the Angular 19 application builder — Dockerfile will need updating (or an `ng build --output-path=dist/geocontext-front` override) before the image builds.
- `docker-compose.geocontext-front.yaml` is a Swarm service pinned to node `bender` behind Traefik with host `${MN_FRONT_URL}`.
- `.travis.yml` is legacy; replace when porting is far enough along.
