import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { Layer } from './layer.interface';
import { GeoJsonFeaturesDescriptor } from './descriptors';
import { MnGeoLayersRegistryService } from './mn-geo-layers-registry.service';

/**
 * Pin-marker visualisation mode: same datasource contract as FeatureLayer,
 * but each Point feature renders as a traditional clickable map marker
 * with a popup. Popup body is the feature's `html` property (raw HTML)
 * when present, otherwise the same property summary the sidebar Details
 * tab shows.
 *
 * Configure in `gcx.json` as:
 *   { "name": "Sites", "type": "markers", "datasource": "places",
 *     "conf": { "htmlField": "popup_html" } }       // optional
 *
 * `htmlField` defaults to `"html"`. Use any property name that holds
 * pre-rendered HTML.
 */
export class MarkersLayer extends Layer {
  constructor() {
    super();
    this.setRequiresDatasources(true);
  }

  override create(): GeoJsonFeaturesDescriptor {
    const conf = this.getConfiguration() ?? {};
    const datasourceName: string | undefined = conf.datasource;
    const data =
      datasourceName !== undefined
        ? this.getDatasourceManager().getDatasource(datasourceName)
        : conf.data;
    // `interactive: false` turns pins into context-only markers — no
    // popup, no click handler, no pointer cursor. The pin still renders.
    const interactive = conf.interactive !== false;

    const desc: GeoJsonFeaturesDescriptor = {
      kind: 'geojson-features',
      id: this.getName() || datasourceName || 'markers',
      data: data ?? { type: 'FeatureCollection', features: [] },
      style: conf.styles?.[0] ?? conf.style,
      marker: 'pins',
    };
    if (interactive) {
      desc.popup = { htmlField: conf.htmlField ?? 'html' };
      desc.onClick = (feature: any) => this.featureClicked(feature);
    }
    return desc;
  }
}

/**
 * Registers the `markers` (alias `marker`) layer type. Drop into
 * `app.config`'s providers alongside `provideMnGeoLayersFeature()`.
 */
export function provideMnGeoLayersMarkers(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const reg = inject(MnGeoLayersRegistryService);
    reg.register('markers', MarkersLayer);
    reg.register('marker', MarkersLayer);
  });
}
