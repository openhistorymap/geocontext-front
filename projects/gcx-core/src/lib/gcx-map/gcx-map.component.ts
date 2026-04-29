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
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
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
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
  template: `
    <!-- Hidden host for the projected flavour directive. The directive
         only needs a DOM mount-point to be instantiated; <mn-map>
         picks it up from us via the [flavour] input below. -->
    <div hidden>
      <ng-content select="[mnMapFlavour], [mnMapFlavourLeaflet], [mnMapFlavourMapbox], [mnMapFlavourMaplibre]" />
    </div>
    <mat-drawer-container class="gcx-map-container" hasBackdrop="false">
      <mat-drawer class="gcx-sidebar" mode="side" [opened]="gcx.sidebarOpen()">
        <header class="gcx-side-head">
          <span class="gcx-side-folio">№ {{ layers().length }}</span>
          <span class="gcx-side-eyebrow">Layers · Atlas</span>
        </header>
        <form class="gcx-search" (submit)="$event.preventDefault()">
          <span class="gcx-search-icon" aria-hidden="true">⌕</span>
          <input
            class="gcx-search-input"
            type="search"
            placeholder="Filter layers…"
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            name="search"
            autocomplete="off"
          />
          @if (searchTerm()) {
            <button
              class="gcx-search-clear"
              type="button"
              aria-label="Clear search"
              (click)="searchTerm.set('')"
            >×</button>
          }
        </form>
        <mat-tab-group
          class="gcx-side-tabs"
          [selectedIndex]="selectedTab()"
          (selectedIndexChange)="selectedTab.set($event)"
        >
          <mat-tab label="Layers">
            <div
              class="gcx-layers"
              cdkDropList
              [cdkDropListDisabled]="!!searchTerm()"
              (cdkDropListDropped)="onReorder($event)"
            >
              @for (layer of filteredLayers(); track layer.name) {
                <div class="gcx-layer" cdkDrag [cdkDragDisabled]="!!searchTerm()">
                  <button
                    type="button"
                    class="gcx-layer-handle"
                    cdkDragHandle
                    [disabled]="!!searchTerm()"
                    [attr.aria-label]="'Drag ' + layer.name + ' to reorder'"
                    [title]="searchTerm() ? 'Clear filter to reorder' : 'Drag to reorder'"
                  >⋮⋮</button>
                  <gcx-legend [style]="layer.style" />
                  <span class="gcx-layer-name">{{ layer.name }}</span>
                  @if (layer.datasource) {
                    <span class="gcx-layer-source">{{ layer.datasource }}</span>
                  }
                  <mat-slide-toggle
                    class="gcx-layer-toggle"
                    [checked]="layer.visible"
                    (change)="toggleVisible(layer)"
                    [aria-label]="'Toggle ' + layer.name"
                  />
                </div>
              } @empty {
                <p class="gcx-empty">No matching layers.</p>
              }
            </div>
          </mat-tab>
          <mat-tab label="Details" [disabled]="!selectedItem()">
            <div class="gcx-detail">
              @if (selectedItem(); as feat) {
                @if (selectedTitle(); as t) {
                  <h3 class="gcx-detail-title">{{ t }}</h3>
                }
                @if (propertyEntries().length) {
                  <dl class="gcx-detail-properties">
                    @for (entry of propertyEntries(); track entry[0]) {
                      <dt>{{ entry[0] }}</dt>
                      <dd>{{ entry[1] }}</dd>
                    }
                  </dl>
                } @else {
                  <p class="gcx-empty">No properties recorded.</p>
                }
              } @else {
                <p class="gcx-empty">Select a feature on the map to see its properties here.</p>
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
         collapses to its content height on first paint. */
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

      /* --- Sidebar (an editorial column, not a Material drawer) ------- */
      .gcx-sidebar {
        width: 320px;
        padding: 0;
        background: var(--gcx-paper);
        border-right: 1px solid var(--gcx-rule);
      }
      ::ng-deep .gcx-sidebar.mat-drawer {
        background: var(--gcx-paper);
      }
      ::ng-deep .gcx-sidebar > .mat-drawer-inner-container {
        display: flex;
        flex-direction: column;
        gap: 0;
        padding: 0;
        overflow: hidden;
      }

      .gcx-side-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        padding: 18px 20px 8px;
        border-bottom: 1px dashed var(--gcx-rule);
      }
      .gcx-side-folio {
        font-family: var(--gcx-display);
        font-style: italic;
        font-size: 1.1rem;
        color: var(--gcx-accent);
        font-variant-numeric: oldstyle-nums tabular-nums;
      }
      .gcx-side-eyebrow {
        font-family: var(--gcx-body);
        font-size: 10.5px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--gcx-ink-faint);
      }

      /* Search row: a single underline, not a Material outlined input. */
      .gcx-search {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px 12px;
        border-bottom: 1px solid var(--gcx-rule);
      }
      .gcx-search-icon {
        font-size: 18px;
        color: var(--gcx-ink-faint);
      }
      .gcx-search-input {
        flex: 1 1 auto;
        appearance: none;
        background: transparent;
        border: 0;
        padding: 4px 0;
        font: 400 var(--gcx-text-base) / 1.4 var(--gcx-body);
        color: var(--gcx-ink);
        outline: none;
        border-bottom: 1px solid transparent;
        transition: border-color 120ms ease;
      }
      .gcx-search-input::placeholder {
        color: var(--gcx-ink-faint);
        font-style: italic;
      }
      .gcx-search-input:focus {
        border-bottom-color: var(--gcx-accent);
      }
      .gcx-search-input::-webkit-search-cancel-button { display: none; }
      .gcx-search-clear {
        appearance: none;
        background: transparent;
        border: 0;
        cursor: pointer;
        padding: 0 6px;
        font: 400 18px / 1 var(--gcx-display);
        color: var(--gcx-ink-faint);
      }
      .gcx-search-clear:hover { color: var(--gcx-accent-deep); }

      /* Tabs adapt — the tabbed strip stays Material for a11y but its
         look is heavily neutralised in styles.scss. */
      ::ng-deep .gcx-side-tabs .mat-mdc-tab-header {
        border-bottom: 1px solid var(--gcx-rule);
      }
      ::ng-deep .gcx-side-tabs .mat-mdc-tab .mdc-tab__text-label {
        font-family: var(--gcx-body) !important;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--gcx-ink-soft);
      }
      ::ng-deep .gcx-side-tabs .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
        color: var(--gcx-accent-deep) !important;
      }
      ::ng-deep .gcx-side-tabs .mdc-tab-indicator__content--underline {
        --mdc-tab-indicator-active-indicator-color: var(--gcx-accent);
      }

      /* --- Layers list — typographic rows, dashed dividers ------------ */
      .gcx-layers {
        padding: 8px 0 14px;
        overflow-x: hidden;
      }
      /* minmax(0, 1fr) — not the implicit minmax(auto, 1fr) — lets the
         text column shrink below its intrinsic width, so a long layer
         name ellipsizes instead of pushing the toggle out of the row. */
      .gcx-layer {
        display: grid;
        grid-template-columns: 18px 22px minmax(0, 1fr) auto;
        grid-template-rows: auto auto;
        column-gap: 12px;
        align-items: center;
        padding: 10px 20px;
        border-bottom: 1px dashed var(--gcx-rule);
        background: var(--gcx-paper);
        cursor: pointer;
        transition: background 120ms ease;
      }
      .gcx-layer:hover { background: var(--gcx-paper-soft); }
      .gcx-layer-handle {
        grid-column: 1;
        grid-row: 1 / span 2;
        align-self: center;
        appearance: none;
        background: transparent;
        border: 0;
        padding: 0 2px;
        cursor: grab;
        font: 600 14px / 1 var(--gcx-body);
        letter-spacing: -2px;
        color: var(--gcx-ink-faint);
        transition: color 120ms ease;
      }
      .gcx-layer-handle:hover:not(:disabled) { color: var(--gcx-accent-deep); }
      .gcx-layer-handle:active { cursor: grabbing; }
      .gcx-layer-handle:disabled { cursor: not-allowed; opacity: 0.3; }
      .gcx-layer gcx-legend {
        grid-column: 2;
        grid-row: 1 / span 2;
        align-self: center;
      }
      .gcx-layer-name {
        grid-column: 3;
        min-width: 0;
        font-family: var(--gcx-display);
        font-size: 1.05rem;
        font-weight: 500;
        color: var(--gcx-ink);
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .gcx-layer-source {
        grid-column: 3;
        min-width: 0;
        font-family: var(--gcx-body);
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--gcx-ink-faint);
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .gcx-layer-toggle {
        grid-column: 4;
        grid-row: 1 / span 2;
        align-self: center;
        flex: 0 0 auto;
      }
      /* CDK drag-drop affordances. The preview is the row being dragged
         (rendered floating); the placeholder is the gap left behind. */
      .gcx-layer.cdk-drag-preview {
        background: var(--gcx-paper);
        box-shadow: 0 2px 0 var(--gcx-accent),
                    0 8px 24px color-mix(in oklch, var(--gcx-ink) 18%, transparent);
        border-bottom: 1px dashed var(--gcx-rule);
      }
      .gcx-layer.cdk-drag-placeholder {
        opacity: 0.35;
        background: color-mix(in oklch, var(--gcx-accent) 8%, var(--gcx-paper));
      }
      .cdk-drop-list-dragging .gcx-layer:not(.cdk-drag-placeholder) {
        transition: transform 200ms cubic-bezier(0, 0, 0.2, 1);
      }

      .gcx-empty {
        padding: 16px 20px;
        margin: 0;
        font-family: var(--gcx-display);
        font-style: italic;
        font-size: 0.95rem;
        color: var(--gcx-ink-faint);
      }

      /* --- Detail panel (selected feature) ---------------------------- */
      .gcx-detail {
        padding: 18px 20px 24px;
        overflow-y: auto;
      }
      .gcx-detail-title {
        margin: 0 0 4px;
        font-family: var(--gcx-display);
        font-weight: 500;
        font-size: 1.35rem;
        line-height: 1.15;
        color: var(--gcx-ink);
      }
      .gcx-detail-title::after {
        content: '';
        display: block;
        width: 28px;
        height: 2px;
        margin-top: 10px;
        margin-bottom: 14px;
        background: var(--gcx-accent);
      }
      .gcx-detail-properties {
        margin: 0;
        display: grid;
        grid-template-columns: minmax(80px, 35%) 1fr;
        column-gap: 12px;
        row-gap: 8px;
        font-size: 0.875rem;
      }
      .gcx-detail-properties dt {
        font-family: var(--gcx-body);
        font-size: 10.5px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--gcx-ink-faint);
        padding-top: 2px;
        word-break: break-word;
      }
      .gcx-detail-properties dd {
        margin: 0;
        font-family: var(--gcx-display);
        font-size: 0.95rem;
        color: var(--gcx-ink);
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

  /**
   * User dragged a row in the sidebar. Reorder the source list and tell
   * the flavour to restack its native layers to match. The drop list is
   * disabled while the search filter is active, so `previousIndex` /
   * `currentIndex` always refer to the unfiltered list and we can mutate
   * it directly with `moveItemInArray`.
   *
   * Convention: the top of the sidebar list is drawn on top of the map.
   * `setLayerOrder(ids)` takes the same convention so flavours don't
   * have to reverse it.
   */
  onReorder(event: CdkDragDrop<ConfiguredLayer[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.layers.update((list) => {
      const next = list.slice();
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });
    const ids = this.layers().map((l) => l.name);
    this.flavour()?.setLayerOrder?.(ids);
  }

  onFeature(event: any): void {
    this.selectedTab.set(1);
    this.selectedItem.set(event);
    this.gcx.openSidebar();
  }
}
