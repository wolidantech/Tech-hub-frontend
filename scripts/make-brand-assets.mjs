#!/usr/bin/env node
/**
 * Derives every DANQEL brand asset from the school's official artwork.
 *
 *   public/logo-original.png   ← drop the supplied PNG here (or let the repo
 *                                 fetch it), then run:
 *   node scripts/make-brand-assets.mjs
 *
 * Outputs (all from the ONE original, so nothing drifts):
 *   public/logo.png            full lockup, transparent bg, dark-surface variant
 *                              (light bg removed; near-black ink → white; blue kept)
 *   public/mark.png            the "D + cap" mark cropped, same variant
 *   public/favicon-32.png      mark on the navy tile
 *   public/apple-touch-icon.png (180) / icon-192.png / icon-512.png
 *   public/icon-maskable-512.png (full-bleed, safe-zone padded)
 *   src/lib/logoPng.js         base64 of a 256px mark, embedded in the certificate
 *
 * If public/logo-original.png is absent the script leaves all current assets
 * untouched (the vector reconstruction shipped at c54b336 stays live).
 * Dependency-free: node:zlib only (PNG decode + encode).
 */
import { inflateSync, deflateSync } from 'node:zlib';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const SRC = join(OUT, 'logo-original.png');

if (!existsSync(SRC)) {
  console.log('public/logo-original.png not present — keeping the current (reconstructed) assets.');
  console.log('Drop the official PNG at public/logo-original.png and re-run to regenerate everything.');
  process.exit(0);
}

/* ------------------------------------------------------------ PNG decode */
function decodePng(buf) {
  let pos = 8;
  let w, h, depth, color, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      depth = data[8]; color = data[9];
      if (depth !== 8 || data[12] !== 0) throw new Error(`unsupported PNG (depth ${depth}, interlace ${data[12]})`);
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (!w || !(color === 2 || color === 6)) throw new Error(`unsupported PNG color type ${color}`);
  const bpp = color === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const out = Buffer.alloc(w * h * 4);
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c;
  };
  let rp = 0;
  const prev = Buffer.alloc(stride);
  const cur = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[rp++];
    for (let i = 0; i < stride; i++) {
      const x = raw[rp++];
      const a = i >= bpp ? cur[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let v;
      switch (f) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + b; break;
        case 3: v = x + ((a + b) >> 1); break;
        case 4: v = x + paeth(a, b, c); break;
        default: throw new Error(`bad filter ${f}`);
      }
      cur[i] = v & 0xff;
    }
    for (let x = 0; x < w; x++) {
      const si = x * bpp, di = (y * w + x) * 4;
      out[di] = cur[si]; out[di + 1] = cur[si + 1]; out[di + 2] = cur[si + 2];
      out[di + 3] = bpp === 4 ? cur[si + 3] : 255;
    }
    cur.copy(prev);
  }
  return { w, h, px: out };
}

/* ------------------------------------------------------------ PNG encode */
const CRC_TABLE = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const bo = Buffer.concat([Buffer.from(type, 'ascii'), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(bo)); return Buffer.concat([l, bo, c]); };
function encodePng(w, h, px) {
  const raw = Buffer.alloc(h * (w * 4 + 1)); let o = 0;
  for (let y = 0; y < h; y++) { raw[o++] = 0; for (let x = 0; x < w; x++) { const di = (y * w + x) * 4; raw[o++] = px[di]; raw[o++] = px[di + 1]; raw[o++] = px[di + 2]; raw[o++] = px[di + 3]; } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/* ------------------------------------------------------- colour transform */
const { w, h, px } = decodePng(readFileSync(SRC));
// The artwork ships with a real alpha channel (transparent background), so the
// dark-surface variant only needs to turn the near-black ink white and keep the
// brand blue; alpha passes through untouched (anti-aliased edges stay smooth).
const isBlue = (i) => px[i + 2] >= 120 && px[i + 2] - px[i] >= 40;
const dark = Buffer.alloc(w * h * 4);
for (let p = 0; p < w * h; p++) {
  const i = p * 4;
  dark[i + 3] = px[i + 3];
  if (px[i + 3] && !isBlue(i)) { dark[i] = 255; dark[i + 1] = 255; dark[i + 2] = 255; }
  else { dark[i] = px[i]; dark[i + 1] = px[i + 1]; dark[i + 2] = px[i + 2]; }
}

// Crop the mark: first row-block from the top, ending at the first tall bg gap.
const rowHit = (y) => { let n = 0; for (let x = 0; x < w; x++) if (dark[(y * w + x) * 4 + 3] > 30) n++; return n; };
let y0 = 0; while (y0 < h && rowHit(y0) === 0) y0++;
let y1 = y0; let gap = 0;
for (let y = y0; y < h; y++) { if (rowHit(y) === 0) { if (++gap > h * 0.02) break; } else { gap = 0; y1 = y; } }
let x0 = w, x1 = 0;
for (let y = y0; y <= y1; y++) for (let x = 0; x < w; x++) if (dark[(y * w + x) * 4 + 3] > 30) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
const mw = x1 - x0 + 1, mh = y1 - y0 + 1;
const mark = Buffer.alloc(mw * mh * 4);
for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) { const s = ((y0 + y) * w + (x0 + x)) * 4, t = (y * mw + x) * 4; mark[t] = dark[s]; mark[t + 1] = dark[s + 1]; mark[t + 2] = dark[s + 2]; mark[t + 3] = dark[s + 3]; }

/* ------------------------------------------------ area-average downscale */
function downscale(src, sw, sh, tw, th) {
  const out = Buffer.alloc(tw * th * 4);
  for (let ty = 0; ty < th; ty++) for (let tx = 0; tx < tw; tx++) {
    const sx0 = Math.floor((tx / tw) * sw), sx1 = Math.max(sx0 + 1, Math.ceil(((tx + 1) / tw) * sw));
    const sy0 = Math.floor((ty / th) * sh), sy1 = Math.max(sy0 + 1, Math.ceil(((ty + 1) / th) * sh));
    let r = 0, g = 0, b = 0, a = 0, wa = 0;
    for (let sy = sy0; sy < sy1; sy++) for (let sx = sx0; sx < sx1; sx++) {
      const i = (sy * sw + sx) * 4, al = src[i + 3] / 255;
      r += src[i] * al; g += src[i + 1] * al; b += src[i + 2] * al; a += al; wa++;
    }
    const o = (ty * tw + tx) * 4, A = a / wa;
    out[o + 3] = Math.round(A * 255);
    out[o] = A ? Math.round(r / a) : 0; out[o + 1] = A ? Math.round(g / a) : 0; out[o + 2] = A ? Math.round(b / a) : 0;
  }
  return out;
}

/* ------------------------------------------------------------- compose */
const NAVY = [2, 10, 31];
function tile(size, markPx, mw2, mh2, { maskable = false } = {}) {
  const pad = size * (maskable ? 0.22 : 0.14);
  const inner = size - pad * 2;
  const s = Math.min(inner / mw2, inner / mh2);
  const dw = Math.round(mw2 * s), dh = Math.round(mh2 * s);
  const dm = downscale(markPx, mw2, mh2, dw, dh);
  const ox = Math.round((size - dw) / 2), oy = Math.round((size - dh) / 2);
  const corner = inner * 0.24;
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const o = (y * size + x) * 4;
    let inside = true;
    if (!maskable) {
      const cx = Math.min(Math.max(x, pad + corner), size - pad - corner);
      const cy = Math.min(Math.max(y, pad + corner), size - pad - corner);
      inside = (x - cx) ** 2 + (y - cy) ** 2 <= corner ** 2;
    }
    if (!inside) { out[o + 3] = 0; continue; }
    out[o] = NAVY[0]; out[o + 1] = NAVY[1]; out[o + 2] = NAVY[2]; out[o + 3] = 255;
    const lx = x - ox, ly = y - oy;
    if (lx >= 0 && lx < dw && ly >= 0 && ly < dh) {
      const i = (ly * dw + lx) * 4, al = dm[i + 3] / 255;
      if (al > 0) { out[o] = Math.round(dm[i] * al + NAVY[0] * (1 - al)); out[o + 1] = Math.round(dm[i + 1] * al + NAVY[1] * (1 - al)); out[o + 2] = Math.round(dm[i + 2] * al + NAVY[2] * (1 - al)); }
    }
  }
  return out;
}

/* ---------------------------------------------------------------- write */
const logoPng = downscale(dark, w, h, 1024, Math.round((1024 / w) * h));
writeFileSync(join(OUT, 'logo.png'), encodePng(1024, Math.round((1024 / w) * h), logoPng));
writeFileSync(join(OUT, 'mark.png'), encodePng(mw, mh, mark));
writeFileSync(join(OUT, 'favicon-32.png'), encodePng(32, 32, tile(32, mark, mw, mh)));
writeFileSync(join(OUT, 'apple-touch-icon.png'), encodePng(180, 180, tile(180, mark, mw, mh)));
writeFileSync(join(OUT, 'icon-192.png'), encodePng(192, 192, tile(192, mark, mw, mh)));
writeFileSync(join(OUT, 'icon-512.png'), encodePng(512, 512, tile(512, mark, mw, mh)));
writeFileSync(join(OUT, 'icon-maskable-512.png'), encodePng(512, 512, tile(512, mark, mw, mh, { maskable: true })));
const cert = downscale(mark, mw, mh, 256, Math.round((256 / mw) * mh));
const certBuf = encodePng(256, Math.round((256 / mw) * mh), cert);
writeFileSync(join(OUT, '..', 'src', 'lib', 'logoPng.js'),
  `// Generated by scripts/make-brand-assets.mjs from public/logo-original.png — do not edit.\nexport const MARK_PNG_B64 = ${JSON.stringify(certBuf.toString('base64'))};\nexport const MARK_PNG_DATA_URL = \`data:image/png;base64,\${MARK_PNG_B64}\`;\n`);
console.log('logo.png, mark.png, icons and src/lib/logoPng.js regenerated from the official artwork.');
