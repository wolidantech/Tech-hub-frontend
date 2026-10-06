#!/usr/bin/env node
/**
 * Generates the DANQEL app icons (favicon, apple-touch-icon, PWA icons) from the
 * same geometric "D" monogram, with no image dependencies — Node's zlib plus a
 * small PNG encoder.
 *
 *   node scripts/make-brand-icons.mjs
 *
 * The artwork is a PLACEHOLDER for the final DANQEL logo (docs/REBRAND_AUDIT.md
 * §4): a monogram tile, never stretched or passed off as finished branding.
 * Swap the drawing below (or replace public/logo.svg + favicon.svg) when the
 * final logo lands and re-run this script.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

/* ---------------------------------------------------------------- PNG writer */
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
};

const encodePng = (size, pixelAt) => {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let o = 0;
  for (let y = 0; y < size; y += 1) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = pixelAt(x, y);
      raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

/* ------------------------------------------------------------- the monogram */
const BG = [2, 10, 31];            // #020a1f — matches theme-color
const CYAN = [34, 211, 238];       // #22d3ee
const BLUE = [37, 99, 235];        // #2563eb

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

/**
 * Draws the "D": a stem plus a bowl (outer disc minus inner disc, right half
 * only). `pad` keeps the mark inside the maskable safe zone.
 */
const drawMonogram = (size, { maskable = false } = {}) => {
  const pad = size * (maskable ? 0.26 : 0.16);
  const inner = size - pad * 2;
  const corner = inner * 0.26;

  // Letter box inside the tile.
  const stemW = inner * 0.17;
  const top = pad + inner * 0.22;
  const bottom = pad + inner * 0.78;
  const left = pad + inner * 0.28;
  const bowlCx = left + stemW;
  const bowlCy = (top + bottom) / 2;
  const rOut = (bottom - top) / 2;
  const rIn = rOut - stemW;

  const inRoundedTile = (x, y) => {
    const x0 = pad; const y0 = pad; const w = inner; const h = inner;
    if (x < x0 || x >= x0 + w || y < y0 || y >= y0 + h) return false;
    const cx = Math.min(Math.max(x, x0 + corner), x0 + w - corner);
    const cy = Math.min(Math.max(y, y0 + corner), y0 + h - corner);
    return (x - cx) ** 2 + (y - cy) ** 2 <= corner ** 2;
  };

  return (x, y) => {
    // Maskable icons are full-bleed; the safe zone is handled by `pad` above.
    // Non-maskable icons are a rounded tile with transparent corners.
    if (!maskable && !inRoundedTile(x, y)) return [0, 0, 0, 0];

    const inStem = x >= left && x < left + stemW && y >= top && y < bottom;
    const dx = x - bowlCx; const dy = y - bowlCy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const inBowl = dx >= -stemW * 0.5 && dist <= rOut && dist >= rIn;

    if (inStem || inBowl) {
      const t = ((x - pad) / inner + (y - pad) / inner) / 2;
      return [lerp(CYAN[0], BLUE[0], t), lerp(CYAN[1], BLUE[1], t), lerp(CYAN[2], BLUE[2], t), 255];
    }
    return [BG[0], BG[1], BG[2], 255];
  };
};

/* --------------------------------------------------------------------- run */
const targets = [
  ['favicon-32.png', 32, {}],
  ['apple-touch-icon.png', 180, {}],
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-maskable-512.png', 512, { maskable: true }],
];

for (const [file, size, opts] of targets) {
  const png = encodePng(size, drawMonogram(size, opts));
  writeFileSync(join(OUT, file), png);
  console.log(`${file.padEnd(24)} ${size}x${size}  ${png.length} bytes`);
}
console.log('DANQEL placeholder icons written to public/ (typographic placeholder, not final artwork)');
