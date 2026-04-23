import { Component, input } from '@angular/core';

/**
 * Declarative style descriptor projected inside `<mn-layer>` children of
 * `<mn-map>`. Flavours read the `style` payload when building their
 * renderer-specific representation of a layer.
 */
@Component({
  selector: 'mn-style',
  standalone: true,
  template: '',
})
export class MnStyleComponent {
  readonly style = input<any>();
}
