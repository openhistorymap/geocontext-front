import {
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  ViewState,
} from '@openhistorymap/mn-geo';
import { GcxCoreService } from '../gcx-core.service';
import { GcxLegendComponent } from '../gcx-legend/gcx-legend.component';

interface DetailMediaItem {
  /** `image` → inline `<img>`, `html` → fetched and rendered via Angular's
   *  HTML sanitizer (cheap pandoc-style fragments work without a markdown
   *  lib), `download` → just a link to the asset. */
  kind: 'image' | 'html' | 'download';
  src: string;
  label?: string;
}

interface DetailConfig {
  /** Feature property key to use as the panel heading. */
  title?: string;
  /** Ordered list of media items. `src` supports `{propname}` interpolation
   *  against the feature's properties. */
  media?: DetailMediaItem[];
}

interface ConfiguredLayer {
  name: string;
  type: string;
  datasource?: string;
  style?: any;
  conf?: any;
  detail?: DetailConfig;
  visible: boolean;
}

interface ResolvedMediaItem extends DetailMediaItem {
  /** Original template, kept so the (error) handler can match on it. */
  template: string;
}

interface ConfiguredDatasource {
  name: string;
  type: string;
  conf: any;
}

/**
 * Shorthand strings the user can put in `gcx.json#background` that map to a
 * registered layer type. Anything not in this map (and not a URL) is passed
 * through as a layer type name, so users can plug in any registered tile
 * provider without enumerating it here.
 */
const BACKGROUND_ALIASES: Record<string, string> = {
  osm: 'osm-tiled',
  ofm: 'ofm-tiled',
};

function resolveBackgroundLayer(bg: any): ConfiguredLayer | null {
  if (bg == null || bg === false || bg === 'none') return null;
  if (typeof bg === 'string') {
    if (/^https?:\/\//i.test(bg)) {
      return { name: 'background', type: 'raster-tiled', conf: { url: bg }, visible: true };
    }
    const type = BACKGROUND_ALIASES[bg] ?? bg;
    return { name: 'background', type, conf: {}, visible: true };
  }
  if (typeof bg === 'object') {
    if (bg.type) {
      return {
        name: bg.name ?? 'background',
        type: bg.type,
        conf: bg.conf ?? {},
        style: bg.style,
        visible: true,
      };
    }
    if (bg.url) {
      return { name: bg.name ?? 'background', type: 'raster-tiled', conf: bg, visible: true };
    }
  }
  return null;
}

function resolveDemLayer(dem: any): ConfiguredLayer | null {
  if (dem == null || dem === false) return null;
  if (typeof dem === 'string') {
    return { name: 'dem', type: 'raster-dem', conf: { url: dem }, visible: true };
  }
  if (typeof dem === 'object') {
    if (dem.type) {
      return {
        name: dem.name ?? 'dem',
        type: dem.type,
        conf: dem.conf ?? {},
        visible: true,
      };
    }
    if (dem.url) {
      return { name: dem.name ?? 'dem', type: 'raster-dem', conf: dem, visible: true };
    }
  }
  return null;
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
                @if (resolvedImages().length) {
                  <div class="gcx-detail-media">
                    @for (m of resolvedImages(); track m.src; let i = $index) {
                      @if (!mediaErrors().has(m.src)) {
                        <figure
                          class="gcx-detail-figure"
                          (click)="openLightbox(i)"
                          (keydown.enter)="openLightbox(i)"
                          (keydown.space)="openLightbox(i); $event.preventDefault()"
                          tabindex="0"
                          role="button"
                          [attr.aria-label]="'Open ' + (m.label ?? 'image') + ' at full size'"
                        >
                          <img
                            [src]="m.src"
                            [alt]="m.label ?? ''"
                            loading="lazy"
                            (error)="onMediaError(m.src)"
                          />
                          @if (m.label) {
                            <figcaption>{{ m.label }}</figcaption>
                          }
                        </figure>
                      }
                    }
                  </div>
                }
                @for (m of resolvedHtml(); track m.src) {
                  @if (!mediaErrors().has(m.src) && htmlCache().get(m.src); as body) {
                    <section class="gcx-detail-html">
                      @if (m.label) {
                        <h4 class="gcx-detail-html-label">{{ m.label }}</h4>
                      }
                      <div class="gcx-detail-html-body" [innerHTML]="body"></div>
                    </section>
                  }
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
                @if (resolvedDownloads().length) {
                  <ul class="gcx-detail-downloads">
                    @for (m of resolvedDownloads(); track m.src) {
                      <li>
                        <a [href]="m.src" target="_blank" rel="noopener">
                          <span class="gcx-dl-icon" aria-hidden="true">↓</span>
                          <span class="gcx-dl-label">{{ m.label ?? m.src }}</span>
                        </a>
                      </li>
                    }
                  </ul>
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
          (mapMoveEnd)="onMapMoveEnd()"
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
              [conf]="layer.conf ?? {}"
              (layerClicked)="onFeature($event, layer)"
            >
              @if (layer.style) {
                <mn-style [style]="layer.style" />
              }
            </mn-layer>
          }
        </mn-map>
      </mat-drawer-content>
    </mat-drawer-container>

    @if (currentLightboxImage(); as m) {
      <!-- Lightbox lives outside <mat-drawer-container> on purpose: the
           drawer content uses transforms during animation, which would
           anchor any descendant position:fixed and clip the overlay. -->
      <div
        class="gcx-lightbox"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="m.label ?? 'Image viewer'"
        (click)="closeLightbox()"
      >
        <button
          type="button"
          class="gcx-lightbox-close"
          (click)="closeLightbox(); $event.stopPropagation()"
          aria-label="Close"
        >×</button>
        @if (resolvedImages().length > 1) {
          <button
            type="button"
            class="gcx-lightbox-nav gcx-lightbox-prev"
            (click)="prevLightbox(); $event.stopPropagation()"
            aria-label="Previous image"
          >‹</button>
          <button
            type="button"
            class="gcx-lightbox-nav gcx-lightbox-next"
            (click)="nextLightbox(); $event.stopPropagation()"
            aria-label="Next image"
          >›</button>
          <div class="gcx-lightbox-counter" aria-live="polite">
            {{ lightboxIndex()! + 1 }} / {{ resolvedImages().length }}
          </div>
        }
        <figure class="gcx-lightbox-figure" (click)="$event.stopPropagation()">
          <img [src]="m.src" [alt]="m.label ?? ''" />
          @if (m.label) {
            <figcaption>{{ m.label }}</figcaption>
          }
        </figure>
      </div>
    }
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

      /* --- Media (images keyed off feature properties) ------------------ */
      .gcx-detail-media {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin: 0 0 18px;
      }
      .gcx-detail-figure {
        margin: 0;
        cursor: zoom-in;
      }
      .gcx-detail-figure:focus-visible {
        outline: 2px solid var(--gcx-accent);
        outline-offset: 2px;
      }
      .gcx-detail-figure img {
        display: block;
        width: 100%;
        height: auto;
        border: 1px solid var(--gcx-rule);
        background: var(--gcx-paper-soft);
        transition: filter 120ms ease;
      }
      .gcx-detail-figure:hover img,
      .gcx-detail-figure:focus-visible img {
        filter: brightness(0.96);
      }
      .gcx-detail-figure figcaption {
        margin-top: 6px;
        font-family: var(--gcx-body);
        font-size: 10.5px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--gcx-ink-faint);
      }

      /* --- Inline HTML (pandoc-derived schede etc.) --------------------- */
      .gcx-detail-html {
        margin: 0 0 18px;
        padding-top: 8px;
        border-top: 1px dashed var(--gcx-rule);
      }
      .gcx-detail-html-label {
        margin: 0 0 10px;
        font-family: var(--gcx-body);
        font-size: 10.5px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--gcx-ink-faint);
      }
      /* The pandoc output is a 2-col grid table with everything centered.
         That works for an A4 page; it does not work in a 320px column.
         Reflow it into a definition-list rhythm: label as small-caps
         eyebrow, value as body — full-width rows, dashed separators. */
      .gcx-detail-html-body {
        font-family: var(--gcx-display);
        font-size: 0.92rem;
        line-height: 1.45;
        color: var(--gcx-ink);
      }
      .gcx-detail-html-body p {
        margin: 0 0 8px;
      }
      .gcx-detail-html-body table,
      .gcx-detail-html-body thead,
      .gcx-detail-html-body tbody,
      .gcx-detail-html-body tr,
      .gcx-detail-html-body th,
      .gcx-detail-html-body td {
        display: block;
        width: auto !important;
        text-align: left !important;
      }
      .gcx-detail-html-body colgroup,
      .gcx-detail-html-body col {
        display: none;
      }
      .gcx-detail-html-body tr {
        padding: 8px 0;
        border-bottom: 1px dashed var(--gcx-rule);
      }
      .gcx-detail-html-body tr:last-child {
        border-bottom: 0;
      }
      .gcx-detail-html-body th,
      .gcx-detail-html-body td:first-child {
        font-family: var(--gcx-body);
        font-size: 10.5px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--gcx-ink-faint);
        padding: 0 0 4px;
      }
      .gcx-detail-html-body td {
        padding: 0;
        word-break: break-word;
      }
      .gcx-detail-html-body .smallcaps {
        font-variant: small-caps;
        font-weight: 600;
        letter-spacing: 0.04em;
      }
      .gcx-detail-html-body em {
        font-style: italic;
        color: var(--gcx-ink);
      }

      /* --- Downloads (off-format attachments: docx, pdf, …) ------------- */
      .gcx-detail-downloads {
        list-style: none;
        margin: 16px 0 0;
        padding: 12px 0 0;
        border-top: 1px dashed var(--gcx-rule);
      }
      .gcx-detail-downloads li + li {
        margin-top: 6px;
      }
      .gcx-detail-downloads a {
        display: inline-flex;
        align-items: baseline;
        gap: 8px;
        font-family: var(--gcx-display);
        font-size: 0.95rem;
        color: var(--gcx-accent-deep);
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: border-color 120ms ease;
      }
      .gcx-detail-downloads a:hover {
        border-bottom-color: var(--gcx-accent);
      }
      .gcx-dl-icon {
        font-family: var(--gcx-body);
        font-size: 0.85rem;
        color: var(--gcx-accent);
      }

      /* --- Lightbox ---------------------------------------------------- */
      /* Full-bleed image overlay. Quiet chrome (a single hairline border
         frames the image, captions stay typographic) — the map is the
         content, and inside the lightbox the image is the content; the
         backdrop just gets out of its way. */
      .gcx-lightbox {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: grid;
        place-items: center;
        padding: 48px 64px;
        background: color-mix(in oklch, var(--gcx-ink) 88%, transparent);
        backdrop-filter: blur(2px);
        animation: gcx-lightbox-fade 140ms ease-out;
      }
      @keyframes gcx-lightbox-fade {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .gcx-lightbox-figure {
        margin: 0;
        max-width: 100%;
        max-height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        cursor: default;
      }
      .gcx-lightbox-figure img {
        display: block;
        max-width: 100%;
        /* leave room for the caption beneath without scrollbars */
        max-height: calc(100vh - 48px * 2 - 40px);
        object-fit: contain;
        border: 1px solid color-mix(in oklch, var(--gcx-paper) 30%, transparent);
        background: var(--gcx-paper-soft);
        box-shadow: 0 16px 48px color-mix(in oklch, #000 50%, transparent);
      }
      .gcx-lightbox-figure figcaption {
        font-family: var(--gcx-body);
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: color-mix(in oklch, var(--gcx-paper) 80%, transparent);
        text-align: center;
      }

      /* Close: top-right; arrows: vertical centred at edges; counter:
         bottom-centre. All three share the same restrained typographic
         affordance — no filled buttons, no circles, no Material chrome. */
      .gcx-lightbox-close,
      .gcx-lightbox-nav {
        position: absolute;
        appearance: none;
        background: transparent;
        border: 0;
        color: color-mix(in oklch, var(--gcx-paper) 85%, transparent);
        cursor: pointer;
        line-height: 1;
        padding: 8px 14px;
        font-family: var(--gcx-display);
        transition: color 120ms ease, transform 120ms ease;
      }
      .gcx-lightbox-close:hover,
      .gcx-lightbox-nav:hover {
        color: var(--gcx-paper);
      }
      .gcx-lightbox-close {
        top: 16px;
        right: 20px;
        font-size: 32px;
        font-weight: 300;
      }
      .gcx-lightbox-nav {
        top: 50%;
        transform: translateY(-50%);
        font-size: 56px;
        font-weight: 300;
      }
      .gcx-lightbox-nav:hover {
        transform: translateY(-50%) scale(1.08);
      }
      .gcx-lightbox-prev { left: 12px; }
      .gcx-lightbox-next { right: 12px; }
      .gcx-lightbox-counter {
        position: absolute;
        bottom: 18px;
        left: 50%;
        transform: translateX(-50%);
        font-family: var(--gcx-display);
        font-style: italic;
        font-variant-numeric: oldstyle-nums tabular-nums;
        font-size: 0.95rem;
        color: color-mix(in oklch, var(--gcx-paper) 70%, transparent);
        letter-spacing: 0.04em;
      }
      .gcx-lightbox-close:focus-visible,
      .gcx-lightbox-nav:focus-visible {
        outline: 1px solid var(--gcx-paper);
        outline-offset: 4px;
      }
    `,
  ],
})
export class GcxMapComponent implements OnDestroy {
  readonly gcx = inject(GcxCoreService);
  private readonly http = inject(HttpClient);

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
  /** Index into `resolvedImages()` of the currently-open lightbox image,
   *  or null when the lightbox is closed. Switching features closes it
   *  (see onFeature). */
  readonly lightboxIndex = signal<number | null>(null);
  /** `detail` block from the layer the selected feature belongs to. Null
   *  when the layer didn't declare one — the panel then falls back to a
   *  bare properties dump. */
  readonly selectedDetail = signal<DetailConfig | null>(null);
  /** Resolved media URLs that 404'd. Hidden in the template so missing
   *  schizzi don't show a broken-image icon for the 90% of features that
   *  have no associated asset. Reset on each feature selection. */
  readonly mediaErrors = signal<Set<string>>(new Set());
  /** Fetched HTML bodies for `kind: "html"` media, keyed by URL. Cache is
   *  global — switching features and back doesn't refetch. Missing entries
   *  mean "not yet fetched"; failures land in `mediaErrors` instead. */
  readonly htmlCache = signal<Map<string, string>>(new Map());
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

  /**
   * Feature title: the layer's `detail.title` property is preferred (so
   * data publishers can name the column that serves as the heading);
   * otherwise we fall back to common GeoJSON property keys.
   */
  readonly selectedTitle = computed<string | null>(() => {
    const props = this.selectedItem()?.properties;
    if (!props) return null;
    const titleKey = this.selectedDetail()?.title;
    if (titleKey && props[titleKey] != null && String(props[titleKey]).trim()) {
      return String(props[titleKey]);
    }
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

  /**
   * Media items declared on the layer's `detail.media[]`, with `{propname}`
   * placeholders in `src` resolved against the selected feature's properties
   * AND the resulting relative path rewritten through `GcxCoreService.
   * resolveAssetUrl()` — so `schizzi/{tomba}.jpg` lands at the same jsdelivr
   * base as the gcx.json itself when in repo mode, or stays page-relative
   * in local /assets mode. Items whose template references a missing
   * property are dropped — that's what makes "this tomb has no docx, but
   * does have a schizzo" render cleanly.
   */
  private readonly resolvedMedia = computed<ResolvedMediaItem[]>(() => {
    const detail = this.selectedDetail();
    const props = this.selectedItem()?.properties;
    if (!detail?.media || !props) return [];
    return detail.media
      .map((m) => {
        const interpolated = interpolate(m.src, props);
        if (interpolated == null) return null;
        const src = this.gcx.resolveAssetUrl(interpolated);
        return { ...m, template: m.src, src };
      })
      .filter((m): m is ResolvedMediaItem => m !== null);
  });

  readonly resolvedImages = computed(() =>
    this.resolvedMedia().filter((m) => m.kind === 'image'),
  );
  /** Image currently shown in the lightbox, or null when closed. Defined
   *  here (not inline in the template) so it survives the lightbox's
   *  own re-renders without re-evaluating filters. */
  readonly currentLightboxImage = computed(() => {
    const i = this.lightboxIndex();
    if (i === null) return null;
    return this.resolvedImages()[i] ?? null;
  });
  readonly resolvedHtml = computed(() =>
    this.resolvedMedia().filter((m) => m.kind === 'html'),
  );
  readonly resolvedDownloads = computed(() =>
    this.resolvedMedia().filter((m) => m.kind === 'download'),
  );

  /** In-flight fetch tracker — prevents the effect from launching duplicate
   *  requests for the same URL while one is already pending. */
  private readonly htmlInFlight = new Set<string>();

  /** View parsed from the URL hash on first load. Used to override the
   *  gcx.json defaults so a shared link puts the user exactly where the
   *  sender was. Read once; subsequent updates are driven by `hashchange`. */
  private readonly initialHashView: ViewState | null = parseLocationHash();
  /** Holds `initialHashView` until the flavour is constructed and we can
   *  apply the full state (bearing/pitch don't live on `<mn-map>` inputs,
   *  so they need a post-setup `setView` call). Nulled after first use. */
  private pendingHashView: ViewState | null = this.initialHashView;

  /** Bound here so removeEventListener can match in ngOnDestroy. */
  private readonly onHashChange = (): void => {
    const v = parseLocationHash();
    if (v) this.flavour()?.setView(v);
  };

  constructor() {
    effect(() => {
      const conf = this.gcx.config();
      if (!conf) return;
      // Hash trumps gcx.json defaults — that's the whole point of sharing.
      const hv = this.initialHashView;
      this.center.set(hv ? [hv.lat, hv.lon] : (conf.center ?? [0, 0]));
      this.startzoom.set(hv?.zoom ?? conf.startzoom ?? 1);
      this.minzoom.set(conf.minzoom ?? 1);
      this.maxzoom.set(conf.maxzoom ?? 19);
      this.datasources.set(conf.datasources ?? []);
      // Sidebar order: ids[0] is drawn on top. So user layers come first,
      // then DEM (hillshade above the basemap), then background last so it
      // ends up at the bottom of the visual stack.
      // A top-level `interactive: false` on a layer entry is folded into
      // `conf` so layer classes (FeatureLayer, MarkersLayer, …) read it
      // through their own configuration without needing a separate input.
      const userLayers: ConfiguredLayer[] = (conf.layers ?? []).map((l: any) => {
        const merged: ConfiguredLayer = { ...l, visible: true };
        if (l.interactive !== undefined) {
          merged.conf = { ...(l.conf ?? {}), interactive: l.interactive };
        }
        return merged;
      });
      const dem = resolveDemLayer(conf['dem']);
      const background = resolveBackgroundLayer(conf['background']);
      const combined: ConfiguredLayer[] = [
        ...userLayers,
        ...(dem ? [dem] : []),
        ...(background ? [background] : []),
      ];
      this.layers.set(combined);
    });

    // Fetch `kind: "html"` media on demand. Triggers whenever the selected
    // feature changes; cached results survive across selections.
    effect(() => {
      const media = this.resolvedHtml();
      const cache = this.htmlCache();
      const errors = this.mediaErrors();
      for (const m of media) {
        const url = m.src;
        if (cache.has(url) || errors.has(url) || this.htmlInFlight.has(url)) continue;
        this.htmlInFlight.add(url);
        this.http.get(url, { responseType: 'text' }).subscribe({
          next: (text) => {
            this.htmlInFlight.delete(url);
            this.htmlCache.update((c) => new Map(c).set(url, text));
          },
          error: () => {
            this.htmlInFlight.delete(url);
            this.onMediaError(url);
          },
        });
      }
    });

    // Apply the pending hash view once the flavour exists. Centre/zoom
    // already came through the `<mn-map>` inputs; this catches bearing
    // and pitch (only meaningful on MapLibre) and reaffirms the rest in
    // case the effect ordering left the map at gcx.json defaults. The
    // microtask defers past `<mn-map>`'s own setup effect.
    effect(() => {
      const flav = this.flavour();
      if (!flav || !this.pendingHashView) return;
      const v = this.pendingHashView;
      queueMicrotask(() => {
        flav.setView(v);
        this.pendingHashView = null;
      });
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', this.onHashChange);
      window.addEventListener('keydown', this.onKeyDown);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('hashchange', this.onHashChange);
      window.removeEventListener('keydown', this.onKeyDown);
    }
  }

  /** Keyboard control for the lightbox: Esc closes, ←/→ navigate when
   *  multiple images are present. Inert while the lightbox is closed so
   *  these keys remain available for the rest of the app. */
  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (this.lightboxIndex() === null) return;
    switch (e.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowLeft':
        if (this.resolvedImages().length > 1) this.prevLightbox();
        break;
      case 'ArrowRight':
        if (this.resolvedImages().length > 1) this.nextLightbox();
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  openLightbox(index: number): void {
    if (index < 0 || index >= this.resolvedImages().length) return;
    this.lightboxIndex.set(index);
  }

  closeLightbox(): void {
    this.lightboxIndex.set(null);
  }

  /** Cycle through `resolvedImages()` — wrapping makes ←/→ feel
   *  continuous on small galleries like a per-tomb schizzo pair. */
  prevLightbox(): void {
    const n = this.resolvedImages().length;
    if (!n) return;
    this.lightboxIndex.update((i) => ((i ?? 0) - 1 + n) % n);
  }
  nextLightbox(): void {
    const n = this.resolvedImages().length;
    if (!n) return;
    this.lightboxIndex.update((i) => ((i ?? 0) + 1) % n);
  }

  /**
   * Called from `<mn-map>`'s `mapMoveEnd`. Reads the flavour's current view
   * and rewrites the URL hash. Uses `history.replaceState` so panning
   * doesn't fill the browser history, and only writes when the hash would
   * actually change — that avoids spurious `hashchange` events feeding back
   * into our own listener.
   */
  onMapMoveEnd(): void {
    if (typeof window === 'undefined') return;
    const v = this.flavour()?.getView();
    if (!v) return;
    const h = '#' + formatViewHash(v);
    if (window.location.hash !== h) {
      window.history.replaceState(null, '', h);
    }
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

  onFeature(event: any, layer: ConfiguredLayer): void {
    this.selectedTab.set(1);
    this.selectedItem.set(event);
    this.selectedDetail.set(layer.detail ?? null);
    this.mediaErrors.set(new Set());
    // A new selection invalidates whatever was in the lightbox — the
    // index points into the old feature's resolvedImages().
    this.lightboxIndex.set(null);
    this.gcx.openSidebar();
  }

  onMediaError(src: string): void {
    this.mediaErrors.update((s) => {
      if (s.has(src)) return s;
      const next = new Set(s);
      next.add(src);
      return next;
    });
  }
}

/**
 * Substitute `{propname}` placeholders in `template` with values from `props`.
 * Returns `null` if any referenced property is missing/empty — the caller
 * uses that to drop the whole media item rather than render a half-resolved
 * URL like `schizzi/.jpg`.
 */
function interpolate(template: string, props: Record<string, any>): string | null {
  let missing = false;
  const resolved = template.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const v = props[key];
    if (v == null || v === '') {
      missing = true;
      return '';
    }
    return String(v);
  });
  return missing ? null : resolved;
}

/**
 * Parse the URL hash as a `zoom/lat/lon[/bearing/pitch]` view. Returns
 * null when no usable view is present — that keeps callers' decision
 * logic ("fall back to gcx.json defaults") concise. Out-of-range values
 * are clamped: lat to ±90, lon wrapped to ±180.
 */
function parseLocationHash(): ViewState | null {
  if (typeof window === 'undefined') return null;
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return null;
  const parts = raw.split('/').map((s) => Number(s));
  if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
  const [zoom, lat, lon, bearing, pitch] = parts;
  return {
    zoom,
    lat: Math.max(-90, Math.min(90, lat)),
    lon: ((lon + 180) % 360 + 360) % 360 - 180,
    bearing: Number.isFinite(bearing) ? bearing : 0,
    pitch: Number.isFinite(pitch) ? pitch : 0,
  };
}

/**
 * Format a ViewState as a hash fragment (without the leading `#`).
 * Bearing/pitch are appended only when non-zero — keeps the URL clean for
 * 2D maps. Zoom uses 2 decimals (jsdelivr-class precision), lat/lon use 5
 * (~1.1 m at the equator — enough for sharing a feature pin).
 */
function formatViewHash(v: ViewState): string {
  const base = `${v.zoom.toFixed(2)}/${v.lat.toFixed(5)}/${v.lon.toFixed(5)}`;
  const hasCamera = Math.abs(v.bearing) >= 0.5 || Math.abs(v.pitch) >= 0.5;
  if (!hasCamera) return base;
  return `${base}/${Math.round(v.bearing)}/${Math.round(v.pitch)}`;
}
