import { Injectable } from '@angular/core';
import { Layer } from './layer.interface';

export interface LayerItem {
  layer: Layer;
  [k: string]: any;
}

/**
 * Orchestrates layer lifecycle against the active map flavour. Layers that
 * depend on datasources are deferred until `displayLayers()` triggers a
 * datasource fetch via the bound DatasourcesmanagerService.
 */
@Injectable({ providedIn: 'root' })
export class LayersmanagerService {
  private readonly layers: Layer[] = [];
  private flavour: any;
  private dsmgr: any;

  private readonly needsData: LayerItem[] = [];
  private readonly independent: LayerItem[] = [];

  setDatasourcemanager(dsmgr: any): void {
    this.dsmgr = dsmgr;
  }

  setFlavour(flavour: any): void {
    this.flavour = flavour;
  }

  addLayer(item: LayerItem): void {
    (item.layer.getRequiresDatasources() ? this.needsData : this.independent).push(item);
  }

  getLayers(): Layer[] {
    return this.layers;
  }

  displayLayers(): void {
    for (const item of this.independent) {
      this.flavour.addLayer(this.instantiate(item));
    }
    this.dsmgr.fetchDatasources().subscribe(() => {
      for (const item of this.needsData) {
        this.flavour.addLayer(this.instantiate(item));
      }
    });
  }

  private instantiate(item: LayerItem): any {
    const lyr = item.layer;
    this.layers.push(lyr);
    lyr.setConfiguration(item);
    if (lyr.getRequiresDatasources()) {
      lyr.setDatasourceManager(this.dsmgr);
    }
    return lyr.create();
  }
}
