import {
  afterNextRender,
  Component,
  contentChildren,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  input,
  OnInit,
  Output,
  viewChild,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { DatasourcesmanagerService } from '@openhistorymap/mn-geo-datasources';
import { LayersmanagerService } from '@openhistorymap/mn-geo-layers';
import { DatasetRegistryService } from '../dataset-registry.service';
import { MnMapFlavourDirective } from '../mn-map-flavour.directive';
import { MnLayerComponent } from '../mn-layer/mn-layer.component';
import { MnDatasourceComponent } from '../mn-datasource/mn-datasource.component';

/**
 * Declarative map host. Picks up its rendering flavour from one of:
 *   - `[flavour]` input (set by an outer wrapper that needs to relay a
 *     content-projected directive — e.g. `<gcx-map>`),
 *   - or a direct content child marked with `[mnMapFlavour*]`.
 *
 * The flavour's `setup(this)` is called once both the flavour and the
 * `<div #map>` element are available; it owns instantiating the underlying
 * Leaflet/MapLibre map and calls `host.ready()` when projected
 * datasources/layers should be flushed in.
 */
@Component({
  selector: 'mn-map',
  standalone: true,
  imports: [NgStyle],
  template: `
    <div #styles></div>
    <div #map [ngStyle]="{ width: width(), height: height() }"></div>
  `,
})
export class MnMapComponent implements OnInit {
  // deliberately retained so flavours/consumers can read the shared caches
  readonly datasetRegistry = inject(DatasetRegistryService);
  private readonly dsMgr = inject(DatasourcesmanagerService);
  private readonly lyrMgr = inject(LayersmanagerService);

  readonly center = input<any>();
  readonly startzoom = input<number>();
  readonly minzoom = input<number>();
  readonly maxzoom = input<number>();

  readonly width = input<string>('100%');
  readonly height = input<string>('90vh');

  @Output() featureSelected = new EventEmitter<any>();
  @Output() featureUnselected = new EventEmitter<any>();
  @Output() mapMoveEnd = new EventEmitter<any>();
  @Output() mapMoveStart = new EventEmitter<any>();

  readonly flavourChildren = contentChildren(MnMapFlavourDirective, { descendants: true });
  /** External relay (e.g. `<gcx-map>` forwards a content-projected
   *  directive that wouldn't otherwise reach `mn-map`'s content query). */
  readonly flavourInput = input<MnMapFlavourDirective | undefined>(undefined, {
    alias: 'flavour',
  });
  readonly datasources = contentChildren(MnDatasourceComponent);
  readonly layers = contentChildren(MnLayerComponent);

  readonly mapElement = viewChild<ElementRef<HTMLElement>>('map');
  readonly stylesElement = viewChild<ElementRef<HTMLElement>>('styles');

  private _flavour: MnMapFlavourDirective | undefined;
  private _setupDone = false;

  constructor() {
    // Setup runs as soon as both flavour and the map element are populated,
    // regardless of which lifecycle phase resolves them. Effect re-runs on
    // any signal change so contentChildren / viewChild / input arrival
    // order doesn't matter.
    effect(() => {
      if (this._setupDone) return;
      const flavour = this.flavourInput() ?? this.flavourChildren()[0];
      const elementRef = this.mapElement();
      if (!flavour || !elementRef?.nativeElement) return;
      this._setupDone = true;
      this._flavour = flavour;
      this.lyrMgr.setFlavour(flavour);
      flavour.setup(this);
    });

    afterNextRender(() => {
      if (!this._setupDone) {
        console.warn(
          '<mn-map>: no flavour directive ([mnMapFlavourLeaflet] / ' +
            '[mnMapFlavourMaplibre]) found and no [flavour] input provided.',
        );
      }
    });
  }

  ngOnInit(): void {
    this.dsMgr.setLayermanager(this.lyrMgr);
    this.lyrMgr.setDatasourcemanager(this.dsMgr);
  }

  /** Called by the flavour once its underlying map is ready to accept layers. */
  ready(): void {
    for (const ds of this.datasources()) {
      this.dsMgr.addDatasource({ name: ds.name(), type: ds.type(), conf: ds.conf() });
    }
    for (const layer of this.layers()) {
      if (layer.layer) {
        this.lyrMgr.addLayer({ layer: layer.layer });
      }
    }
    this.lyrMgr.displayLayers();
  }

  getElement(): HTMLElement | undefined {
    return this.mapElement()?.nativeElement;
  }

  getStyles(): HTMLElement | undefined {
    return this.stylesElement()?.nativeElement;
  }

  getLayers() {
    return this.lyrMgr.getLayers();
  }
}
