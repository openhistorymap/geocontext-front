import {
  AfterContentInit,
  Component,
  contentChildren,
  EventEmitter,
  inject,
  input,
  Output,
} from '@angular/core';
import { MnGeoLayersRegistryService, Layer } from '@modalnodes/mn-geo-layers';
import { MnStyleComponent } from '../mn-style/mn-style.component';

/**
 * Declarative layer entry projected into `<mn-map>`. Resolves a registered
 * Layer class via `MnGeoLayersRegistryService`, attaches projected
 * `<mn-style>` children, and surfaces feature clicks through `layerClicked`.
 */
@Component({
  selector: 'mn-layer',
  standalone: true,
  template: '',
})
export class MnLayerComponent implements AfterContentInit {
  private readonly layers = inject(MnGeoLayersRegistryService);

  readonly name = input<string>('');
  readonly type = input<string>('');
  readonly datasource = input<string | undefined>();
  readonly conf = input<any>({});
  readonly setup = input<any>();

  @Output() layerClicked = new EventEmitter<any>();

  readonly styles = contentChildren(MnStyleComponent);

  private _layer: Layer | undefined;
  get layer(): Layer | undefined {
    return this._layer;
  }

  ngAfterContentInit(): void {
    const resolvedConf: any = { ...(this.conf() ?? {}) };
    const setup = this.setup();
    const name = setup?.name ?? this.name();
    const type = setup?.type ?? this.type();
    const conf = setup?.conf ?? resolvedConf;
    const datasource = this.datasource();

    if (datasource) {
      conf.datasource = datasource;
      conf.styles = this.styles().map((s) => s.style());
    }

    const layer = this.layers.for(type) as Layer;
    layer.setName(name);
    layer.setConfiguration(conf);
    layer.setClickable(this.layerClicked);
    this._layer = layer;
  }
}
