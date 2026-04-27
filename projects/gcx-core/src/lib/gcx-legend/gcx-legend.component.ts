import { Component, computed, input } from '@angular/core';

/**
 * Layer legend swatch. Renders the marker fill colour from `style.options`
 * as a small filled disc with a thin ink stroke — same visual logic as the
 * point markers on the map, scaled down to a sidebar legend.
 */
@Component({
  selector: 'gcx-legend',
  standalone: true,
  template: `
    <span class="swatch" [style.background]="color()" [style.border-color]="strokeColor()"></span>
  `,
  styles: [
    `
      .swatch {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 1px solid var(--gcx-ink-soft);
        box-shadow: 0 0 0 2px var(--gcx-paper);
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
      'transparent'
    );
  });

  readonly strokeColor = computed<string>(() => {
    const s = this.style();
    return s?.options?.color ?? s?.color ?? 'var(--gcx-ink-soft)';
  });
}
