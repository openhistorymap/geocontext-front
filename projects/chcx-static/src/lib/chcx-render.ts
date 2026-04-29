import { marked } from 'marked';

export type ChcxFormat = 'html' | 'markdown' | 'cff';

const EXT_MAP: Record<string, ChcxFormat> = {
  md: 'markdown',
  markdown: 'markdown',
  cff: 'cff',
  html: 'html',
  htm: 'html',
};

/**
 * Pick a format for a `mode: 'file'` page when none was set explicitly.
 * Looks at the URL's extension (after stripping query/hash) and falls
 * back to `'html'`.
 */
export function inferFormatFromUrl(url: string): ChcxFormat {
  if (!url) return 'html';
  const clean = url.split('#')[0].split('?')[0];
  const dot = clean.lastIndexOf('.');
  if (dot < 0) return 'html';
  const ext = clean.slice(dot + 1).toLowerCase();
  return EXT_MAP[ext] ?? 'html';
}

/**
 * Renders an html/markdown payload to a trustable HTML string. CFF is
 * not handled here — it's rendered by `ChcxCitationComponent` so the UI
 * can offer interactive format export via citation.js. Caller is expected
 * to bypass DomSanitizer; payloads come from the same repo as the
 * deployed app or from a public repo the user is intentionally browsing.
 */
export function renderPayload(text: string, format: ChcxFormat): string {
  if (format === 'markdown') return renderMarkdown(text);
  return text;
}

function renderMarkdown(text: string): string {
  const out = marked.parse(text, { async: false, gfm: true, breaks: false });
  return typeof out === 'string' ? out : '';
}
