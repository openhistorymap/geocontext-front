import {
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import {
  MnMapComponent,
  MnLayerComponent,
  MnDatasourceComponent,
  MnStyleComponent,
  MnMapFlavourDirective,
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
    FormsModule,
    MatSidenavModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MnMapComponent,
    MnLayerComponent,
    MnDatasourceComponent,
    MnStyleComponent,
    GcxLegendComponent,
  ],
  template: `
    <!-- Hidden host for the projected flavour directive. The directive
         only needs a DOM mount-point to be instantiated; <mn-map>
         picks it up from us via the [flavour] input below. -->
    <div hidden>
      <ng-content select="[mnMapFlavour], [mnMapFlavourLeaflet], [mnMapFlavourMapbox], [mnMapFlavourMaplibre]" />
    </div>
    <mat-drawer-container class="gcx-map-container" hasBackdrop="false">
      <mat-drawer mode="side" [opened]="gcx.sidebarOpen()">
        <form class="gcx-search-form" (submit)="$event.preventDefault()">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-icon matPrefix>search</mat-icon>
            <mat-label>Filter layers</mat-label>
            <input
              matInput
              type="search"
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              name="search"
              autocomplete="off"
            />
            @if (searchTerm()) {
              <button
                matSuffix
                mat-icon-button
                type="button"
                aria-label="Clear search"
                (click)="searchTerm.set('')"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
        </form>
        <mat-tab-group [selectedIndex]="selectedTab()" (selectedIndexChange)="selectedTab.set($event)">
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon title="Layers">layers</mat-icon>
            </ng-template>
            <div class="gcx-layers-panel">
              @for (layer of filteredLayers(); track layer.name) {
                <mat-slide-toggle
                  color="primary"
                  [checked]="layer.visible"
                  (change)="toggleVisible(layer)"
                >
                  <gcx-legend [style]="layer.style" />
                  {{ layer.name }}
                </mat-slide-toggle>
              } @empty {
                <p class="gcx-layers-empty">No matching layers.</p>
              }
            </div>
          </mat-tab>
          <mat-tab [disabled]="!selectedItem()">
            <ng-template mat-tab-label>
              <mat-icon title="Details">place</mat-icon>
            </ng-template>
            <div class="gcx-info">
              @if (selectedItem(); as feat) {
                @if (selectedTitle(); as t) {
                  <h3 class="gcx-info-title">{{ t }}</h3>
                }
                @if (propertyEntries().length) {
                  <dl class="gcx-info-properties">
                    @for (entry of propertyEntries(); track entry[0]) {
                      <dt>{{ entry[0] }}</dt>
                      <dd>{{ entry[1] }}</dd>
                    }
                  </dl>
                } @else {
                  <p class="gcx-layers-empty">No properties.</p>
                }
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-drawer>
      <mat-drawer-content>
        <mn-map
          #map
          [flavour]="flavour()"
          [center]="center()"
          [startzoom]="startzoom()"
          [minzoom]="minzoom()"
          [maxzoom]="maxzoom()"
          height="100%"
        >
          @for (ds of datasources(); track ds.name) {
            <mn-datasource [name]="ds.name" [type]="ds.type" [conf]="ds.conf" />
          }
          @for (layer of layers(); track layer.name) {
            <!-- Always render — visibility is toggled on the flavour via
                 setLayerVisibility, not by removing the mn-layer (which
                 would orphan the underlying renderer state). -->
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
        </mn-map>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .gcx-map-container {
        width: 100%;
        height: 100%;
      }
      /* mat-drawer-content needs explicit height + flex column so
         <mn-map> can fill it. Without this, Material's drawer-content
         collapses to its content height (the sidebar) on first paint. */
      ::ng-deep .gcx-map-container .mat-drawer-content {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      mn-map {
        flex: 1 1 auto;
        min-height: 0;
        display: block;
      }
      mat-drawer {
        width: 330px;
      }
      .gcx-search-form {
        padding: 8px;
        box-sizing: border-box;
        width: 100%;
      }
      .gcx-search-form mat-form-field {
        width: 100%;
      }
      .gcx-layers-panel {
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .gcx-layers-empty {
        color: rgba(0, 0, 0, 0.55);
        font-style: italic;
        padding: 4px 0;
        margin: 0;
      }
      .gcx-info {
        padding: 12px 16px;
        overflow-y: auto;
      }
      .gcx-info-title {
        margin: 0 0 12px;
        font-size: 1.05rem;
        font-weight: 500;
      }
      .gcx-info-properties {
        margin: 0;
        display: grid;
        grid-template-columns: minmax(80px, 35%) 1fr;
        column-gap: 12px;
        row-gap: 6px;
        font-size: 0.875rem;
      }
      .gcx-info-properties dt {
        font-weight: 500;
        color: rgba(0, 0, 0, 0.65);
        word-break: break-word;
      }
      .gcx-info-properties dd {
        margin: 0;
        word-break: break-word;
      }
    `,
  ],
})
export class GcxMapComponent {
  readonly gcx = inject(GcxCoreService);

  readonly map = viewChild<MnMapComponent>('map');
  /** Flavour directive content-projected via `<gcx-map><div mnMapFlavour…/></gcx-map>`.
   *  Relayed to `<mn-map>`'s `[flavour]` input because content-projected
   *  directives don't surface in the inner component's contentChildren. */
  readonly flavours = contentChildren(MnMapFlavourDirective, { descendants: true });
  readonly flavour = computed(() => this.flavours()[0]);

  readonly center = signal<any>([0, 0]);
  readonly startzoom = signal<number>(1);
  readonly minzoom = signal<number>(1);
  readonly maxzoom = signal<number>(19);

  readonly datasources = signal<ConfiguredDatasource[]>([]);
  readonly layers = signal<ConfiguredLayer[]>([]);

  readonly selectedTab = signal<number>(0);
  readonly selectedItem = signal<any>(null);
  readonly searchTerm = signal<string>('');

  /** Layer list filtered by the search input. Empty term shows everything. */
  readonly filteredLayers = computed<ConfiguredLayer[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.layers();
    if (!term) return list;
    return list.filter((l) =>
      [l.name, l.type, l.datasource].some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(term),
      ),
    );
  });

  /** Best-guess feature title from common GeoJSON property keys. */
  readonly selectedTitle = computed<string | null>(() => {
    const props = this.selectedItem()?.properties;
    if (!props) return null;
    for (const key of ['name', 'title', 'nome', 'label']) {
      if (typeof props[key] === 'string' && props[key].trim()) return props[key];
    }
    return null;
  });

  readonly propertyEntries = computed<[string, any][]>(() => {
    const props = this.selectedItem()?.properties;
    if (!props || typeof props !== 'object') return [];
    return Object.entries(props).filter(
      ([, v]) => v !== null && v !== undefined && v !== '',
    );
  });

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
    const next = !layer.visible;
    this.layers.update((list) =>
      list.map((l) => (l.name === layer.name ? { ...l, visible: next } : l)),
    );
    // Tell the active flavour to show/hide the rendered layer in place —
    // re-rendering the mn-layer through @if would re-create the layer and
    // lose subscriptions / source state.
    this.flavour()?.setLayerVisibility?.(layer.name, next);
  }

  onFeature(event: any): void {
    this.selectedTab.set(1);
    this.selectedItem.set(event);
    this.gcx.openSidebar();
  }
}
