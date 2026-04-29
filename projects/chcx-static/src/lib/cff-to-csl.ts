import { load as yamlLoad } from 'js-yaml';

/**
 * Minimal CSL-JSON shape — enough for citation.js to format into BibTeX,
 * RIS, and bibliography styles. Field names match the CSL-JSON schema
 * (e.g. capitalized `DOI`, `URL`).
 */
export interface CslEntry {
  id: string;
  type: string;
  title?: string;
  author?: Array<{ family?: string; given?: string; literal?: string }>;
  issued?: { 'date-parts': number[][] };
  version?: string;
  DOI?: string;
  URL?: string;
  abstract?: string;
  keyword?: string;
  publisher?: string;
  note?: string;
}

const TYPE_MAP: Record<string, string> = {
  software: 'software',
  dataset: 'dataset',
  article: 'article-journal',
  conference: 'paper-conference',
  'conference-paper': 'paper-conference',
  proceedings: 'paper-conference',
  book: 'book',
  thesis: 'thesis',
  report: 'report',
  generic: 'document',
};

/**
 * Converts a CITATION.cff YAML payload to a CSL-JSON entry. If
 * `preferred-citation` is present (a more detailed reference block per
 * the CFF 1.2 spec), its fields override the top-level ones.
 *
 * Throws on unparseable YAML; returns a best-effort entry on missing
 * fields (`id` always set so citation.js doesn't reject it).
 */
export function cffToCsl(yamlText: string): CslEntry {
  const data = (yamlLoad(yamlText) ?? {}) as Record<string, any>;
  const ref = (data['preferred-citation'] && typeof data['preferred-citation'] === 'object')
    ? { ...data, ...data['preferred-citation'] }
    : data;

  const out: CslEntry = {
    id: cslId(ref),
    type: TYPE_MAP[String(ref.type ?? 'software').toLowerCase()] ?? 'software',
  };
  if (ref.title) out.title = String(ref.title);

  const authors = mapAuthors(ref.authors);
  if (authors.length) out.author = authors;

  const dp = dateParts(ref['date-released'] ?? ref.year);
  if (dp) out.issued = { 'date-parts': [dp] };

  if (ref.version) out.version = String(ref.version);
  if (ref.doi) out.DOI = String(ref.doi);

  const url = ref.url ?? ref['repository-code'] ?? ref.repository;
  if (url) out.URL = String(url);

  if (ref.abstract) out.abstract = String(ref.abstract);
  else if (ref.message) out.abstract = String(ref.message);

  if (Array.isArray(ref.keywords) && ref.keywords.length) {
    out.keyword = ref.keywords.join(', ');
  }

  if (ref.publisher && typeof ref.publisher === 'object' && ref.publisher.name) {
    out.publisher = String(ref.publisher.name);
  } else if (typeof ref.publisher === 'string') {
    out.publisher = ref.publisher;
  }

  if (ref.license) out.note = `License: ${ref.license}`;

  return out;
}

function mapAuthors(authors: any): NonNullable<CslEntry['author']> {
  if (!Array.isArray(authors)) return [];
  return authors
    .map((a: any) => {
      if (!a) return null;
      if (typeof a === 'string') return { literal: a };
      if (a.name) return { literal: String(a.name) };
      const family = a['family-names'] ? String(a['family-names']) : undefined;
      const given = a['given-names'] ? String(a['given-names']) : undefined;
      if (!family && !given) return null;
      const out: { family?: string; given?: string } = {};
      if (family) out.family = family;
      if (given) out.given = given;
      return out;
    })
    .filter((a): a is { family?: string; given?: string; literal?: string } => !!a);
}

function dateParts(d: any): number[] | null {
  if (!d) return null;
  const s = String(d).trim();
  const m = s.match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
  if (!m) return null;
  const parts = [Number(m[1])];
  if (m[2]) parts.push(Number(m[2]));
  if (m[3]) parts.push(Number(m[3]));
  return parts;
}

function cslId(ref: any): string {
  const firstAuthor = Array.isArray(ref.authors) ? ref.authors[0] : null;
  const last = firstAuthor?.['family-names'] ?? firstAuthor?.name ?? 'anon';
  const year = String(ref['date-released'] ?? ref.year ?? '').slice(0, 4);
  const word = String(ref.title ?? 'work').split(/\s+/).find((w: string) => w.length > 3) ?? 'work';
  const id = `${last}${year}${word}`.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return id || 'citation';
}
