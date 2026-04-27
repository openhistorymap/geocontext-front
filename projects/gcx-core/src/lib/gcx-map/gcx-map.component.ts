import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {
  MnMapComponent,
  MnLayerComponent,
  MnDatasourceComponent,
  MnStyleComponent,
} from '@openhistorymap/mn-geo';
import { GcxCoreService } from '../gcx-core.service';
import { GcxLegendComponent } from '../gcx-legend/gcx-legend.component';

interface ConfiguredLayer {
  name: string;
  type: string;
  datasource?: string;
  style?: any;
  visible: boolean;
}

interface ConfiguredDatasource {
  name: string;
  type: string;
  conf: any;
}

/**
 * Map page: Material drawer with layer list + tab panels on the left,
 * `<mn-map>` filling the right. Reads datasources/layers from
 * GcxCoreService (backed by /assets/gcx.json).
 *
 * The concrete flavour (Leaflet / MapLibre) is NOT embedded here —
 * consumers project one via `<gcx-map><div mnMapFlavourLeaflet></div></gcx-map>`
 * so the shell stays renderer-agnostic.
 */
@Component({
  selector: 'gcx-map',
  standalone: true,
  imports: [
    JsonPipe,
    MatSidenavModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MnMapComponent,
    MnLayerComponent,
    MnDatasourceComponent,
    MnStyleComponent,
    GcxLegendComponent,
  ],
  template: `
    <mat-drawer-container class="gcx-map-container" hasBackdrop="false">
      <mat-drawer mode="side" [opened]="gcx.sidebarOpen()">
        <form class="gcx-search-form">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Search</mat-label>
            <input matInput type="search" />
          </mat-form-field>
        </form>
        <mat-tab-group [selectedIndex]="selectedTab()">
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon title="Layers">layers</mat-icon>
            </ng-template>
            <div class="gcx-layers-panel">
              @for (layer of layers(); track layer.name) {
                <mat-slide-toggle
                  color="primary"
                  [checked]="layer.visible"
                  (change)="toggleVisible(layer)"
                >
                  <gcx-legend [style]="layer.style" />
                  {{ layer.name }}
                </mat-slide-toggle>
              }
            </div>
          </mat-tab>
          <mat-tab [disabled]="!selectedItem()">
            <ng-template mat-tab-label>
              <mat-icon title="Info">place</mat-icon>
            </ng-template>
            <pre class="gcx-info">{{ selectedItem() | json }}</pre>
          </mat-tab>
        </mat-tab-group>
      </mat-drawer>
      <mat-drawer-content>
        <mn-map
          #map
          [center]="center()"
          [startzoom]="startzoom()"
          [minzoom]="minzoom()"
          [maxzoom]="maxzoom()"
          height="100%"
        >
          <ng-content select="[mnMapFlavour], [mnMapFlavourLeaflet], [mnMapFlavourMapbox], [mnMapFlavourMaplibre]" />
          @for (ds of datasources(); track ds.name) {
            <mn-datasource [name]="ds.name" [type]="ds.type" [conf]="ds.conf" />
          }
          @for (layer of layers(); track layer.name) {
            @if (layer.visible) {
              <mn-layer
                [name]="layer.name"
                [type]="layer.type"
                [datasource]="layer.datasource"
                (layerClicked)="onFeature($event)"
              >
                @if (layer.style) {
                  <mn-style [style]="layer.style" />
                }
              </mn-layer>
            }
          }
        </mn-map>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styles: [
    `
      :host,
      .gcx-map-container {
        display: block;
        width: 100%;
        height: 100%;
      }
      mat-drawer {
        width: 330px;
      }
      .gcx-search-form {
        padding: 8px;
      }
      .gcx-layers-panel {
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .gcx-info {
        padding: 8px;
        white-space: pre-wrap;
        word-break: break-word;
      }
    `,
  ],
})
export class GcxMapComponent {
  readonly gcx = inject(GcxCoreService);

  readonly map = viewChild<MnMapComponent>('map');

  readonly center = signal<any>([0, 0]);
  readonly startzoom = signal<number>(1);
  readonly minzoom = signal<number>(1);
  readonly maxzoom = signal<number>(19);

  readonly datasources = signal<ConfiguredDatasource[]>([]);
  readonly layers = signal<ConfiguredLayer[]>([]);

  readonly selectedTab = signal<number>(0);
  readonly selectedItem = signal<any>(null);

  constructor() {
    effect(() => {
      const conf = this.gcx.config();
      if (!conf) return;
      this.center.set(conf.center ?? [0, 0]);
      this.startzoom.set(conf.startzoom ?? 1);
      this.minzoom.set(conf.minzoom ?? 1);
      this.maxzoom.set(conf.maxzoom ?? 19);
      this.datasources.set(conf.datasources ?? []);
      this.layers.set(
        (conf.layers ?? []).map((l: any) => ({ ...l, visible: true })),
      );
    });
  }

  toggleVisible(layer: ConfiguredLayer): void {
    this.layers.update((list) =>
      list.map((l) => (l.name === layer.name ? { ...l, visible: !l.visible } : l))
    );
  }

  onFeature(event: any): void {
    this.selectedTab.set(1);
    this.selectedItem.set(event);
    this.gcx.openSidebar();
  }
}
