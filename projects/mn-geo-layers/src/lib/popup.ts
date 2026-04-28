/**
 * Popup HTML builder shared by every flavour that supports popups.
 *
 * Logic:
 *   1. If the feature has a non-empty string at `feature.properties[htmlField]`
 *      (default field name `html`), return it verbatim. The author chose
 *      to ship custom popup HTML; trust it.
 *   2. Otherwise, render the same property summary the sidebar shows:
 *        - title: first non-empty among `name`, `title`, `nome`, `label`,
 *        - a `<dl>` of remaining non-empty properties.
 *
 * Returns a serialised HTML string that Leaflet's `bindPopup` and
 * MapLibre's `maplibregl.Popup#setHTML` both accept directly. CSS lives
 * in the app (styles.scss) so popups stay typographically aligned with
 * the rest of the chrome.
 */

const TITLE_KEYS = ['name', 'title', 'nome', 'label'] as const;

export function buildPopupHtml(feature: any, htmlField = 'html'): string {
  const props = (feature?.properties ?? {}) as Record<string, unknown>;

  const raw = props[htmlField];
  if (typeof raw === 'string' && raw.trim()) {
    return `<div class="gcx-popup gcx-popup-html">${raw}</div>`;
  }

  let titleKey: string | undefined;
  for (const k of TITLE_KEYS) {
    const v = props[k];
    if (typeof v === 'string' && v.trim()) {
      titleKey = k;
      break;
    }
  }
  const title = titleKey ? String(props[titleKey]) : '';

  const entries = Object.entries(props).filter(
    ([k, v]) =>
      k !== titleKey &&
      k !== htmlField &&
      v !== null &&
      v !== undefined &&
      v !== '',
  );

  const titleHtml = title
    ? `<h3 class="gcx-popup-title">${escapeHtml(title)}</h3>`
    : '';
  const dlHtml = entries.length
    ? `<dl class="gcx-popup-properties">${entries
        .map(
          ([k, v]) =>
            `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(stringify(v))}</dd>`,
        )
        .join('')}</dl>`
    : '<p class="gcx-popup-empty">No properties recorded.</p>';

  return `<div class="gcx-popup">${titleHtml}${dlHtml}</div>`;
}

function stringify(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
