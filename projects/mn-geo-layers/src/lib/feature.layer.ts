import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { Layer } from './layer.interface';
import { GeoJsonFeaturesDescriptor } from './descriptors';
import { MnGeoLayersRegistryService } from './mn-geo-layers-registry.service';

/**
 * Renders a datasource's resolved GeoJSON as a `geojson-features` descriptor.
 * The datasource (`gcx.json` `datasources[].name`) must already be registered
 * — `LayersmanagerService.displayLayers()` defers feature layers until
 * `DatasourcesmanagerService.fetchDatasources()` resolves.
 */
export class FeatureLayer extends Layer {
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

    const style = conf.styles?.[0] ?? conf.style;

    return {
      kind: 'geojson-features',
      id: this.getName() || datasourceName || 'features',
      data: data ?? { type: 'FeatureCollection', features: [] },
      style,
      onClick: (feature: any) => this.featureClicked(feature),
    };
  }
}

/**
 * Registers the `feature` (alias `features`) layer type — the common GeoJSON
 * renderer — with `MnGeoLayersRegistryService`. Drop into `app.config`'s
 * providers; pairs with `provideMnGeoDatasourcesGeojson()` from
 * `@openhistorymap/mn-geo-datasources` for static GeoJSON files.
 */
export function provideMnGeoLayersFeature(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const reg = inject(MnGeoLayersRegistryService);
    reg.register('feature', FeatureLayer);
    reg.register('features', FeatureLayer);
  });
}
