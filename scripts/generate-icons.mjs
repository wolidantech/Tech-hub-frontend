#!/usr/bin/env node
// ============================================================
// Regenerates the raster app icons that phones need, from public/favicon.svg.
//
//   npm i -D @resvg/resvg-js      (one time — it is not a runtime dependency)
//   node scripts/generate-icons.mjs
//
// Why these files exist: iOS refuses an SVG `apple-touch-icon` and falls back to
// a screenshot of the page, and Android's installable-PWA prompt ignores an
// SVG-only icon set. Both want PNGs, so they are committed as static assets
// instead of being built at deploy time.
//
//   public/apple-touch-icon.png      180x180  iOS home screen
//   public/favicon-32.png             32x32   PNG favicon fallback
//   public/icon-192.png              192x192  Android PWA
//   public/icon-512.png              512x512  Android PWA
//   public/icon-maskable-512.png     512x512  Android adaptive icon (safe zone)
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'public');

let Resvg;
try {
  ({ Resvg } = await import('@resvg/resvg-js'));
} catch {
  console.error('Missing dependency. Install it once, then re-run:\n\n  npm i -D @resvg/resvg-js\n');
  process.exit(1);
}

/** Solid, opaque tile: iOS composites alpha onto black, which looks broken. */
const TILE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs>
  <rect width="100" height="100" fill="#020a1f"/>
  <rect x="10" y="10" width="80" height="80" rx="18" fill="url(#g)"/>
  <path d="m25 32 9 34 16-23 16 23 9-34" fill="none" stroke="white" stroke-width="7" stroke-linejoin="round"/>
</svg>`;

/** Maskable: Android crops to a circle/squircle, so the art must sit inside the
 *  central 80% "safe zone" or it gets clipped. */
const MASKABLE = TILE.replace(
  '<rect x="10" y="10" width="80" height="80" rx="18" fill="url(#g)"/>',
  '<g transform="translate(50 50) scale(0.62) translate(-50 -50)"><rect x="4" y="4" width="92" height="92" rx="22" fill="url(#g)"/>'
).replace(
  '<path d="m25 32 9 34 16-23 16 23 9-34" fill="none" stroke="white" stroke-width="7" stroke-linejoin="round"/>',
  '<path d="m25 32 9 34 16-23 16 23 9-34" fill="none" stroke="white" stroke-width="7" stroke-linejoin="round"/></g>'
);

/** The rounded brand mark, used for the small browser-tab sizes. */
const FAVICON = readFileSync(join(outDir, 'favicon.svg'), 'utf8');

const targets = [
  { file: 'apple-touch-icon.png', svg: TILE, width: 180 },
  { file: 'favicon-32.png', svg: FAVICON, width: 32 },
  { file: 'icon-192.png', svg: TILE, width: 192 },
  { file: 'icon-512.png', svg: TILE, width: 512 },
  { file: 'icon-maskable-512.png', svg: MASKABLE, width: 512 },
];

for (const { file, svg, width } of targets) {
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: false }, // icons have no text; keeps output identical everywhere
  }).render().asPng();
  writeFileSync(join(outDir, file), png);
  console.log(`wrote public/${file} (${width}x${width}, ${png.length} bytes)`);
}
