import { Component, input } from '@angular/core';

/**
 * Minimal style preview swatch for a layer legend row. The legacy
 * implementation was a placeholder; this matches its API surface
 * (`[style]` input) so the template stays interchangeable.
 */
@Component({
  selector: 'gcx-legend',
  standalone: true,
  template: `
    @if (style()) {
      <span
        class="swatch"
        [style.background]="style()?.fillColor ?? style()?.color ?? '#888'"
      ></span>
    }
  `,
  styles: [
    `
      .swatch {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 6px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        vertical-align: middle;
      }
    `,
  ],
})
export class GcxLegendComponent {
  readonly style = input<any>();
}
