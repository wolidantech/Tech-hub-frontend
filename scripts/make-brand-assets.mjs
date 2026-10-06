#!/usr/bin/env node
/**
 * Renders the DANQEL raster icons (favicon, apple-touch, PWA, maskable) from the
 * geometric logo rebuilt from the school's artwork (scripts/logo-geometry.mjs).
 * Dependency-free: Node zlib + a tiny PNG encoder. The cap is drawn white on the
 * navy tile so the mark stays legible on the app's dark theme.
 *
 *   node scripts/make-brand-assets.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markShapes, COLORS } from './logo-geometry.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

/* PNG encoder ---------------------------------------------------------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return t;
})();
const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const encodePng = (size, px) => {
  const raw = Buffer.alloc(size * (size * 4 + 1)); let o = 0;
  for (let y = 0; y < size; y++) { raw[o++] = 0; for (let x = 0; x < size; x++) { const [r, g, b, a] = px(x, y); raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = a; } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
};

/* icon rasterizer ------------------------------------------------------ */
const BG = [2, 10, 31];
const WHITE = [255, 255, 255];

function icon(size, { maskable = false } = {}) {
  const { blue, navy } = markShapes();
  // Crop to the mark's own bounds so it fills the tile.
  const B = { x0: 100, y0: 74, x1: 450, y1: 438 };
  const pad = size * (maskable ? 0.24 : 0.15);
  const scale = (size - pad * 2) / Math.max(B.x1 - B.x0, B.y1 - B.y0);
  const corner = (size - pad * 2) * 0.24;
  const inTile = (x, y) => {
    if (maskable) return true;
    const x0 = pad, y0 = pad, w = size - pad * 2;
    if (x < x0 || x >= x0 + w || y < y0 || y >= y0 + w) return false;
    const cx = Math.min(Math.max(x, x0 + corner), x0 + w - corner);
    const cy = Math.min(Math.max(y, y0 + corner), y0 + w - corner);
    return (x - cx) ** 2 + (y - cy) ** 2 <= corner ** 2;
  };
  return (x, y) => {
    if (!inTile(x, y)) return [0, 0, 0, 0];
    const mx = B.x0 + (x - pad) / scale, my = B.y0 + (y - pad) / scale;
    if (blue(mx, my)) return [...COLORS.blue, 255];
    if (navy(mx, my)) return [...WHITE, 255]; // white cap on the dark tile
    return [...BG, 255];
  };
}

const targets = [
  ['favicon-32.png', 32, {}],
  ['apple-touch-icon.png', 180, {}],
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-maskable-512.png', 512, { maskable: true }],
];
for (const [file, size, opts] of targets) {
  const png = encodePng(size, icon(size, opts));
  writeFileSync(join(OUT, file), png);
  console.log(`${file.padEnd(24)} ${size}x${size}  ${png.length} bytes`);
}
console.log('DANQEL icons rendered from the rebuilt logo geometry.');

/* SVG emitters (single source for <img> use and certificate embedding) ---- */
import { wordPolygons, Q_SLASH } from './logo-geometry.mjs';
import { writeFileSync as wf } from 'node:fs';

const B = '#2151E3';
const markInner = (capFill) => `
  <g fill="${B}" mask="url(#__m)">
    <rect x="176" y="80" width="74" height="352"/>
    <rect x="176" y="80" width="164" height="72"/>
    <rect x="176" y="360" width="164" height="72"/>
    <path d="M340 80 A176 176 0 0 1 340 432 L340 360 A104 104 0 0 0 340 150 Z"/>
    <rect x="136" y="106" width="32" height="32"/><rect x="100" y="144" width="24" height="24"/>
    <rect x="138" y="160" width="32" height="32"/><rect x="118" y="204" width="24" height="24"/>
  </g>
  <g fill="${capFill}">
    <path d="M316 188 L412 232 L316 276 L220 232 Z"/>
    <rect x="262" y="252" width="108" height="54" rx="8"/>
    <rect x="398" y="236" width="8" height="64"/><circle cx="402" cy="306" r="9"/>
    <path d="M398 306 L410 306 L416 336 L404 336 Z"/>
  </g>`;
const maskDef = (id) => `<mask id="${id}"><rect x="90" y="66" width="372" height="380" fill="#fff"/><rect x="150" y="300" width="120" height="26" fill="#000" transform="rotate(-45 210 313)"/><rect x="150" y="352" width="120" height="26" fill="#000" transform="rotate(-45 210 365)"/></mask>`;

const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="96 70 360 372" role="img" aria-label="DANQEL DIGITAL INSTITUTE"><defs>${maskDef('__m')}</defs>${markInner('#ffffff')}</svg>`;

const wp = wordPolygons('DANQEL', 1.0, 95, 620, 24);
const qX = 95 + (78 + 24) + (80 + 24) + (78 + 24);
const path = (polys, fill) => `<path fill="${fill}" fill-rule="evenodd" d="${polys.map((p) => 'M' + p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z').join('')}"/>`;
const word = path(wp.polys, '#ffffff');
const qslash = path([Q_SLASH.map(([x, y]) => [x + qX, y + 620 - 4])], B);

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 950" role="img" aria-label="DANQEL DIGITAL INSTITUTE — Technology • Science • Digital Learning"><defs>${maskDef('__m2')}</defs><g transform="translate(110,10) scale(1.05)">${markInner('#ffffff').replace(/url\(#__m\)/g, 'url(#__m2)')}</g>${word}${qslash}<text x="380" y="800" text-anchor="middle" font-family="'Plus Jakarta Sans',Arial,sans-serif" font-size="56" font-weight="700" letter-spacing="8" fill="${B}">DIGITAL INSTITUTE</text><text x="380" y="868" text-anchor="middle" font-family="'Plus Jakarta Sans',Arial,sans-serif" font-size="34" letter-spacing="2" fill="#c9cede">Technology • Science • Digital Learning</text></svg>`;

wf(join(OUT, 'mark.svg'), MARK_SVG);
wf(join(OUT, 'favicon.svg'), MARK_SVG); // favicon = the real mark
wf(join(OUT, 'logo.svg'), LOGO_SVG);
wf(join(OUT, '..', 'src', 'lib', 'logoSvg.js'),
  `// Generated by scripts/make-brand-assets.mjs — do not edit by hand.\nexport const MARK_SVG = ${JSON.stringify(MARK_SVG)};\nexport const LOGO_SVG = ${JSON.stringify(LOGO_SVG)};\n`);
console.log('mark.svg, logo.svg and src/lib/logoSvg.js emitted');
