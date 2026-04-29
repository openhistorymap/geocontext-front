// Citation.js v0.7 ships no .d.ts files. We only touch a tiny slice of
// the API (the `Cite` class via dynamic import + a few format strings),
// so a minimal ambient module shim is enough to keep TS happy.
declare module '@citation-js/core' {
  export class Cite {
    constructor(data: unknown);
    format(format: string, options?: Record<string, unknown>): string;
  }
  const _default: { Cite: typeof Cite };
  export default _default;
}

declare module '@citation-js/plugin-csl' {
  const plugin: unknown;
  export default plugin;
}
declare module '@citation-js/plugin-bibtex' {
  const plugin: unknown;
  export default plugin;
}
declare module '@citation-js/plugin-ris' {
  const plugin: unknown;
  export default plugin;
}
