#!/usr/bin/env bash
# Build every ported library in dependency order, then the main app.
# Ordering matters: `ng build <app>` does NOT transitively build library
# dependencies — the app resolves them from `dist/` via tsconfig paths.
# Adding a newly ported library here is the one place to touch; both CI
# workflows call this script.
set -euo pipefail

LIBS=(
  mn-registry
  mn-geo-datasources
  mn-geo-layers
  mn-geo
  mn-geo-flavours-leaflet
  mn-geo-flavours-mapbox
  mn-geo-layers-osm
  mn-geo-layers-ofm
  mn-geo-layers-geomqtt
  gcx-core
)

for lib in "${LIBS[@]}"; do
  echo "::group::ng build $lib"
  npx ng build "$lib"
  echo "::endgroup::"
done

echo "::group::ng build (app)"
APP_FLAGS=()
if [ -n "${BASE_HREF:-}" ]; then
  APP_FLAGS+=(--base-href "$BASE_HREF")
fi
npx ng build --configuration=production "${APP_FLAGS[@]}"
echo "::endgroup::"
