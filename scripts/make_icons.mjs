#!/usr/bin/env node
// ============================================================
// Generates raster PWA icons + OG image from the official brand mark.
// Pure Node (no canvas/fonts): signed-distance rendering of the
// WOLI DAN TECH HUB logo into PNGs, so the repo ships real icons without
// any third-party assets or copyrighted marks.
//   node scripts/make_icons.mjs
// Outputs:
//   public/icons/icon-192.png, icon-512.png, apple-touch-icon.png,
//   maskable-512.png, and public/og-image.png
// ============================================================
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------- colors ----------
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const NAVY = hex('#020a1f');
const CYAN = hex('#22d3ee');
const SKY = hex('#0ea5e9');
const BLUE = hex('#2563eb');
const LIGHT = hex('#67e8f9');

const mix = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
const gradientAt = (t) => (t <= 0.55 ? mix(CYAN, SKY, t / 0.55) : mix(SKY, BLUE, (t - 0.55) / 0.45));

// ---------- SDF helpers ----------
const sdRoundBox = (px, py, cx, cy, hw, hh, r) => {
  const dx = Math.abs(px - cx) - (hw - r);
  const dy = Math.abs(py - cy) - (hh - r);
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r;
};
const sdCircle = (px, py, cx, cy, r) => Math.hypot(px - cx, py - cy) - r;
const sdSegment = (px, py, ax, ay, bx, by) => {
  const abx = bx - ax; const aby = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby || 1e-9)));
  return Math.hypot(px - (ax + abx * t), py - (ay + aby * t));
};
const cov = (d, aa) => Math.min(1, Math.max(0, 0.5 - d / aa));

/**
 * Render a size×size icon.
 *  opts.bg:   'navy' (tile on navy), 'gradient' (full-bleed gradient),
 *             'transparent'
 *  opts.mark: size of the gradient tile + mark relative to the canvas
 *             (1 = fills the canvas as a rounded tile)
 */
function renderLogo(size, { bg = 'navy', mark = 1 } = {}) {
  const out = new Float64Array(size * size * 3); // RGB only (bg resolved here)
  const S = size;
  const c = S / 2;
  const tile = S * 0.94 * mark;
  const half = tile / 2;
  const radius = tile * 0.24;
  const aa = (S / 100) * 1.4;
  const u = tile / 100;
  const pts = [[20, 29], [35, 71], [50, 42], [65, 71], [80, 29]].map(([x, y]) => [c + (x - 50) * u, c + (y - 50) * u]);
  const lw = (tile * 10.5) / 100 / 2 + aa * 0.5;
  const sup = S >= 400 ? 2 : 3;
  const fullBleed = bg === 'gradient';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let R = 0; let G = 0; let B = 0;
      for (let sy = 0; sy < sup; sy++) {
        for (let sx = 0; sx < sup; sx++) {
          const px = x + sx / sup;
          const py = y + sy / sup;
          const inTile = fullBleed ? 1 : cov(sdRoundBox(px, py, c, c, half, half, radius), aa);
          // base pixel
          const tG = Math.min(1, Math.max(0, (px + py) / (2 * S)));
          let r; let g; let b; let clip;
          if (fullBleed) {
            [r, g, b] = gradientAt(tG);
            clip = inTile * cov(sdRoundBox(px, py, c, c, half, half, radius), aa);
          } else {
            const t = Math.min(1, Math.max(0, ((px - (c - half)) + (py - (c - half))) / (half * 2)));
            const [tr, tg, tb] = gradientAt(t);
            if (bg === 'transparent') {
              if (inTile <= 0) continue;
              r = tr; g = tg; b = tb; clip = inTile;
            } else { // 'navy' — the tile floats on the app's navy background
              r = NAVY[0] + (tr - NAVY[0]) * inTile;
              g = NAVY[1] + (tg - NAVY[1]) * inTile;
              b = NAVY[2] + (tb - NAVY[2]) * inTile;
              clip = inTile;
            }
          }
          // W stroke (white)
          let dW = Infinity;
          for (let i = 0; i < pts.length - 1; i++) dW = Math.min(dW, sdSegment(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]) - lw);
          const cW = cov(dW, aa) * clip;
          r += (255 - r) * cW; g += (255 - g) * cW; b += (255 - b) * cW;
          // learning-path nodes
          for (const [nx, ny] of [[20, 29], [80, 29]]) {
            const x0 = c + (nx - 50) * u; const y0 = c + (ny - 50) * u;
            const cD = cov(sdCircle(px, py, x0, y0, u * 5.4), aa) * clip;
            r += (NAVY[0] - r) * cD; g += (NAVY[1] - g) * cD; b += (NAVY[2] - b) * cD;
            const cN = cov(sdCircle(px, py, x0, y0, u * 2.3), aa) * clip;
            r += (255 - r) * cN; g += (255 - g) * cN; b += (255 - b) * cN;
          }
          // progress spark
          {
            const x0 = c + 35.5 * u; const y0 = c - 33.5 * u;
            const cRing = cov(sdCircle(px, py, x0, y0, u * 8.3), aa) * clip;
            r += (NAVY[0] - r) * cRing; g += (NAVY[1] - g) * cRing; b += (NAVY[2] - b) * cRing;
            const cSpk = cov(sdCircle(px, py, x0, y0, u * 5.7), aa) * clip;
            r += (LIGHT[0] - r) * cSpk; g += (LIGHT[1] - g) * cSpk; b += (LIGHT[2] - b) * cSpk;
          }
          R += r; G += g; B += b;
        }
      }
      const n = sup * sup;
      const i = (y * size + x) * 3;
      out[i] = R / n; out[i + 1] = G / n; out[i + 2] = B / n;
    }
  }
  return out;
}

// ---------- PNG encoder ----------
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let crc = n;
    for (let k = 0; k < 8; k++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    t[n] = crc >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const pngChunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
function encodePng(width, height, rgb) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      const o = y * (width * 3 + 1) + 1 + x * 3;
      raw[o] = Math.round(rgb[i]); raw[o + 1] = Math.round(rgb[i + 1]); raw[o + 2] = Math.round(rgb[i + 2]);
    }
  }
  return Buffer.concat([sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', deflateSync(raw, { level: 9 })), pngChunk('IEND', Buffer.alloc(0))]);
}

// ---------- outputs ----------
const iconsDir = join(root, 'public/icons');
mkdirSync(iconsDir, { recursive: true });

const jobs = [
  ['icon-192.png', 192, { bg: 'navy' }],
  ['icon-512.png', 512, { bg: 'navy' }],
  ['apple-touch-icon.png', 180, { bg: 'navy' }],
  // maskable: full-bleed brand gradient with the mark at 72% (safe zone)
  ['maskable-512.png', 512, { bg: 'gradient', mark: 0.72 }],
];
for (const [name, size, opts] of jobs) {
  writeFileSync(join(iconsDir, name), encodePng(size, size, renderLogo(size, opts)));
  console.log(`wrote public/icons/${name} (${size}×${size})`);
}

// OG image 1200×630 — deep brand wash, centered tile (left-weighted for text later)
const W = 1200; const H = 630;
const og = new Float64Array(W * H * 3);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    const t = Math.min(1, Math.max(0, ((x / W) + (y / H)) / 2 * 0.4));
    const col = mix(NAVY, gradientAt(t), t * 0.55);
    og[i] = col[0]; og[i + 1] = col[1]; og[i + 2] = col[2];
  }
}
const tileN = Math.floor(H * 0.66);
const tile = renderLogo(tileN, { bg: 'navy' });
const ox = Math.round(W * 0.1);
const oy = Math.round((H - tileN) / 2);
for (let y = 0; y < tileN; y++) {
  for (let x = 0; x < tileN; x++) {
    const si = (y * tileN + x) * 3;
    const di = ((oy + y) * W + (ox + x)) * 3;
    if (ox + x < 0 || oy + y < 0 || ox + x >= W || oy + y >= H) continue;
    const nearNavy = Math.abs(tile[si] - NAVY[0]) + Math.abs(tile[si + 1] - NAVY[1]) + Math.abs(tile[si + 2] - NAVY[2]) < 10;
    if (nearNavy) continue; // tile's navy halo blends into the OG background
    og[di] = tile[si]; og[di + 1] = tile[si + 1]; og[di + 2] = tile[si + 2];
  }
}
writeFileSync(join(root, 'public/og-image.png'), encodePng(W, H, og));
console.log('wrote public/og-image.png (1200×630)');
