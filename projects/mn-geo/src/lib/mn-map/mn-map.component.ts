import {
  AfterContentInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  input,
  Output,
  viewChild,
  contentChildren,
  OnInit,
} from '@angular/core';
import { NgStyle } from '@angular/common';
import { DatasourcesmanagerService } from '@modalnodes/mn-geo-datasources';
import { LayersmanagerService } from '@modalnodes/mn-geo-layers';
import { DatasetRegistryService } from '../dataset-registry.service';
import { MnMapFlavourDirective } from '../mn-map-flavour.directive';
import { MnLayerComponent } from '../mn-layer/mn-layer.component';
import { MnDatasourceComponent } from '../mn-datasource/mn-datasource.component';

/**
 * Declarative map host. Projects a single `[mnMapFlavour]` child (the
 * renderer adapter) plus any number of `<mn-layer>` / `<mn-datasource>`
 * children, wires the manager services together, and defers bootstrap to
 * `ready()` which the flavour calls back once the underlying map is live.
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
export class MnMapComponent implements OnInit, AfterContentInit {
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

  readonly flavour = contentChildren(MnMapFlavourDirective, { descendants: true });
  readonly datasources = contentChildren(MnDatasourceComponent);
  readonly layers = contentChildren(MnLayerComponent);

  readonly mapElement = viewChild<ElementRef<HTMLElement>>('map');
  readonly stylesElement = viewChild<ElementRef<HTMLElement>>('styles');

  private _flavour: MnMapFlavourDirective | undefined;

  ngOnInit(): void {
    this.dsMgr.setLayermanager(this.lyrMgr);
    this.lyrMgr.setDatasourcemanager(this.dsMgr);
  }

  ngAfterContentInit(): void {
    const flavour = this.flavour()[0];
    if (!flavour) {
      throw new Error('<mn-map> requires a child directive marked with [mnMapFlavour].');
    }
    this._flavour = flavour;
    this.lyrMgr.setFlavour(flavour);
    flavour.setup(this);
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
