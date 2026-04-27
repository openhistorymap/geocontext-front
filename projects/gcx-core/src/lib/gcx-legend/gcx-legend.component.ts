import { Component, computed, input } from '@angular/core';

/**
 * Minimal style preview swatch for a layer legend row. Reads the same
 * `style.options` block that the flavours render with so the toggle and
 * the points on the map agree visually.
 */
@Component({
  selector: 'gcx-legend',
  standalone: true,
  template: `
    <span class="swatch" [style.background]="color()"></span>
  `,
  styles: [
    `
      .swatch {
        display: inline-block;
        width: 14px;
        height: 14px;
        margin-right: 8px;
        border: 1px solid rgba(0, 0, 0, 0.25);
        border-radius: 50%;
        vertical-align: middle;
      }
    `,
  ],
})
export class GcxLegendComponent {
  readonly style = input<any>();

  readonly color = computed<string>(() => {
    const s = this.style();
    return (
      s?.options?.fillColor ??
      s?.fillColor ??
      s?.options?.color ??
      s?.color ??
      '#888'
    );
  });
}
