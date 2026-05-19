import { Component, computed, input } from '@angular/core';

interface MatchCase {
  label: string;
  color: string;
}

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
 * When the layer uses `style.maplibre` (raw GL style-spec layers) and a
 * paint property is a categorical `["match", input, k1, v1, k2, v2, …, fallback]`
 * expression, the swatch is replaced by a small case list showing each
 * label and its colour. That's the only legible way to read a layer
 * whose paint switches on a feature property — the simple "one fillColor"
 * disc would lie. Zoom-dependent expressions are intentionally ignored
 * here: the user said legend reads independent of zoom, and an
 * `interpolate` over zoom doesn't have a "primary" colour to picture.
 */
@Component({
  selector: 'gcx-legend',
  standalone: true,
  template: `
    @if (cases().length) {
      <ul class="legend-cases">
        @for (c of cases(); track $index) {
          <li class="legend-case">
            <span
              class="swatch"
              [class.swatch-marker]="mode() === 'marker'"
              [class.swatch-line]="mode() === 'line'"
              [class.swatch-polygon]="mode() === 'polygon'"
              [style.background]="c.color"
              [style.height.px]="mode() === 'line' ? lineWeight() : null"
              [style.border-color]="mode() === 'polygon' ? strokeColor() : null"
            ></span>
            <span class="legend-case-label">{{ c.label }}</span>
          </li>
        }
      </ul>
    } @else {
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
    }
  `,
  styles: [
    `
      :host {
        display: inline-block;
        vertical-align: middle;
      }
      .swatch {
        display: inline-block;
        vertical-align: middle;
        box-shadow: 0 0 0 2px var(--gcx-paper);
      }
      .swatch-marker {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 1px solid var(--gcx-ink-soft);
      }
      .swatch-line {
        width: 14px;
        min-height: 2px;
        border-radius: 1px;
      }
      .swatch-polygon {
        width: 12px;
        height: 9px;
        border-style: solid;
        border-color: var(--gcx-ink-soft);
      }

      /* The case list — one row per match arm, the swatch on the left,
         the property value on the right. Kept tight: 11 px label,
         narrow row, lower-case so it reads as a caption rather than
         competing with the layer name above. */
      .legend-cases {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
        font-family: var(--gcx-body);
        font-size: 11px;
        line-height: 1.15;
        color: var(--gcx-ink-soft);
      }
      .legend-case {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .legend-case-label {
        max-width: 110px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
    // When `style.maplibre` is present, infer mode from the first
    // GL layer spec's type instead — the high-level `style.mode` may
    // be absent and the user is in raw-expression territory.
    const ml = normaliseMaplibre(s?.maplibre);
    if (ml.length) {
      const t = ml[0]?.type;
      if (t === 'line') return 'line';
      if (t === 'fill') return 'polygon';
      if (t === 'circle' || t === 'symbol' || t === 'heatmap') return 'marker';
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

  /** Categorical match-cases pulled from the first colour paint property
   *  of the first `style.maplibre` GL layer spec we recognise. Empty when
   *  the layer uses simple `style.options`, or when the expression is
   *  non-categorical (e.g. `interpolate` over `zoom` — which we ignore
   *  on purpose). */
  readonly cases = computed<MatchCase[]>(() => {
    const s = this.style();
    const layers = normaliseMaplibre(s?.maplibre);
    for (const layer of layers) {
      const paint = layer?.paint;
      if (!paint || typeof paint !== 'object') continue;
      for (const prop of COLOUR_PAINT_PROPS) {
        const cs = extractMatchCases(paint[prop]);
        if (cs && cs.length) return cs;
      }
    }
    return [];
  });
}

const COLOUR_PAINT_PROPS = [
  'circle-color',
  'fill-color',
  'line-color',
  'icon-color',
  'text-color',
] as const;

function normaliseMaplibre(input: any): any[] {
  if (!input) return [];
  return Array.isArray(input) ? input : [input];
}

/**
 * Parse a MapLibre `match` expression into a legend-ready case list.
 *
 * Shape:  ["match", input, k1, v1, k2, v2, …, fallback]
 *
 * `kᵢ` may be a single value or an array (multi-label arm). Non-string
 * `vᵢ` (nested expressions, RGBA arrays, …) are skipped — the legend can
 * only paint a CSS colour string. The fallback colour is appended as an
 * "other" row when it's a plain string and at least one explicit arm
 * was emitted; that keeps the list honest about what the renderer
 * will draw for unmatched features.
 */
function extractMatchCases(expr: any): MatchCase[] | null {
  if (!Array.isArray(expr) || expr.length < 4 || expr[0] !== 'match') return null;
  const cases: MatchCase[] = [];
  // arms are at odd-from-2 indices for the key, even-from-3 for the value
  for (let i = 2; i < expr.length - 1; i += 2) {
    const keys = expr[i];
    const colour = expr[i + 1];
    if (typeof colour !== 'string') continue;
    const label = Array.isArray(keys)
      ? keys.map(String).join(' / ')
      : String(keys);
    cases.push({ label, color: colour });
  }
  const fallback = expr[expr.length - 1];
  if (cases.length && typeof fallback === 'string') {
    cases.push({ label: 'other', color: fallback });
  }
  return cases.length ? cases : null;
}
