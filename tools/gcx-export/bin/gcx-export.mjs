#!/usr/bin/env node
/**
 * gcx-export — vector SVG export of a GeoContext repository, ready
 * to be rasterised + GeoTIFF-ed downstream. See ../README.md for
 * usage; this file is the CLI entry point.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { loadGcxRepo } from '../lib/load.mjs';
import { renderSvg, computeBbox } from '../lib/render.mjs';

function parseArgs(argv) {
  const args = { _: [], width: 4096, bbox: null, out: null, background: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--width') args.width = Number(argv[++i]);
    else if (a === '--bbox') args.bbox = argv[++i].split(',').map(Number);
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--background') args.background = argv[++i];
    else if (a === '-h' || a === '--help') args.help = true;
    else args._.push(a);
  }
  return args;
}

function help() {
  process.stdout.write(`gcx-export — vector SVG export of a GeoContext repo

usage:  gcx-export <repo-dir> [options]

options:
  --out <path>            output SVG (default: <repo>/exports/<basename>.svg)
  --width <px>            SVG width in pixels (default: 4096)
  --bbox <W,S,E,N>        clip/pad to a specific WGS84 bbox (default: data extent)
  --background <id>       backgrounds[] option id to use (default: gcx.json's
                          \`background\` field, then backgrounds[0])
  -h, --help              this message

A <out>.bbox.json sidecar is written next to the SVG with the bbox
and pixel dimensions — feed it to gdal_translate -a_ullr to produce
a GeoTIFF.
`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || args._.length === 0) {
    help();
    process.exit(args.help ? 0 : 1);
  }
  const repoDir = path.resolve(args._[0]);
  const repoName = path.basename(repoDir);

  const { config, datasources } = await loadGcxRepo(repoDir);

  const bbox = Array.isArray(args.bbox) && args.bbox.length === 4 && args.bbox.every(Number.isFinite)
    ? args.bbox
    : computeBbox(datasources);

  const { svg, sidecar } = renderSvg({
    config,
    datasources,
    bbox,
    width: args.width,
    backgroundId: args.background,
  });

  const outPath = args.out
    ? path.resolve(args.out)
    : path.join(repoDir, 'exports', `${repoName}.svg`);
  const sidecarPath = outPath.replace(/\.svg$/i, '.bbox.json');

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, svg, 'utf8');
  await fs.writeFile(sidecarPath, JSON.stringify(sidecar, null, 2), 'utf8');

  const [w, s, e, n] = bbox;
  process.stdout.write(`wrote ${outPath}\n`);
  process.stdout.write(`      ${sidecarPath}\n`);
  process.stdout.write(`bbox  W=${w}  S=${s}  E=${e}  N=${n}\n`);
  process.stdout.write(`size  ${sidecar.size.width}×${sidecar.size.height}\n`);
  process.stdout.write(
    `\nrasterise + georef downstream:\n` +
      `  rsvg-convert -w ${sidecar.size.width} ${outPath} > out.png\n` +
      `  gdal_translate -of GTiff -a_srs EPSG:4326 -a_ullr ${w} ${n} ${e} ${s} out.png out.tif\n`,
  );
}

main().catch((err) => {
  process.stderr.write(`gcx-export: ${err.stack ?? err.message ?? err}\n`);
  process.exit(2);
});
