import { Component, computed, input } from '@angular/core';

/**
 * Layer legend swatch. Reads the layer's `style` block and renders a
 * shape that matches its rendering mode:
 *   - `mode: 'marker'` (or anything that supplies a `markerType` /
 *     `radius` — the legacy mapbox marker shape) → filled disc.
 *   - `mode: 'line'` → horizontal stroke at the configured colour /
 *     thickness, capped to legend size.
 *   - `mode: 'polygon'` → small outlined square with the polygon fill
 *     and stroke colours.
 *
 * Same visual logic as the renderer (`FeatureLayer` → MapLibre's
 * circle/line/fill sublayers, Leaflet's geoJSON style options),
 * scaled down to a 14-px sidebar swatch.
 */
@Component({
  selector: 'gcx-legend',
  standalone: true,
  template: `
    @switch (mode()) {
      @case ('line') {
        <span
          class="swatch swatch-line"
          [style.background]="strokeColor()"
          [style.height.px]="lineWeight()"
        ></span>
      }
      @case ('polygon') {
        <span
          class="swatch swatch-polygon"
          [style.background]="fillColor()"
          [style.border-color]="strokeColor()"
          [style.border-width.px]="lineWeight()"
        ></span>
      }
      @default {
        <span
          class="swatch swatch-marker"
          [style.background]="fillColor()"
          [style.border-color]="strokeColor()"
        ></span>
      }
    }
  `,
  styles: [
    `
      .swatch {
        display: inline-block;
        vertical-align: middle;
        box-shadow: 0 0 0 2px var(--gcx-paper);
      }
      .swatch-marker {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 1px solid var(--gcx-ink-soft);
      }
      .swatch-line {
        width: 16px;
        min-height: 2px;
        border-radius: 1px;
      }
      .swatch-polygon {
        width: 14px;
        height: 10px;
        border-style: solid;
        border-color: var(--gcx-ink-soft);
      }
    `,
  ],
})
export class GcxLegendComponent {
  readonly style = input<any>();

  /** Best-guess rendering mode. `style.mode` wins; otherwise we infer
   *  from the presence of `markerType` / `radius` (points) vs `weight`
   *  alone (lines/polys are disambiguated by `fillColor`). */
  readonly mode = computed<'marker' | 'line' | 'polygon'>(() => {
    const s = this.style();
    const declared = s?.mode;
    if (declared === 'line' || declared === 'polygon' || declared === 'marker') {
      return declared;
    }
    const opts = s?.options ?? s ?? {};
    if (opts.markerType || opts.radius !== undefined) return 'marker';
    if (opts.fillColor || opts.fillOpacity !== undefined) return 'polygon';
    if (opts.weight !== undefined || opts.color) return 'line';
    return 'marker';
  });

  readonly fillColor = computed<string>(() => {
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
    return (
      s?.options?.color ??
      s?.color ??
      s?.options?.fillColor ??
      s?.fillColor ??
      'var(--gcx-ink-soft)'
    );
  });

  /** Stroke thickness for the line / polygon-border swatch. Clamped so a
   *  weight of 8 doesn't render a swatch that dwarfs its row. */
  readonly lineWeight = computed<number>(() => {
    const s = this.style();
    const w = Number(s?.options?.weight ?? s?.weight ?? 2);
    if (!Number.isFinite(w) || w <= 0) return 2;
    return Math.min(6, Math.max(1, Math.round(w)));
  });
}
