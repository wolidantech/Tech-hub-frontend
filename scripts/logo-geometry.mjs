/**
 * Single geometric source for the DANQEL DIGITAL INSTITUTE logo, rebuilt as
 * vector shapes from the artwork supplied by the school (a blue "D" with a
 * pixel-dissolve and a graduation cap in the counter, the DANQEL wordmark with a
 * blue Q-slash, DIGITAL INSTITUTE and the strapline).
 *
 * The same shape data renders the raster icons (make-brand-assets.mjs) and emits
 * the SVG lockups, so vector and raster can never drift apart.
 */

export const COLORS = {
  blue: [33, 81, 227],      // #2151E3 — the D, pixels, Q-slash, DIGITAL INSTITUTE
  navy: [23, 26, 44],       // #171A2C — cap + wordmark on light backgrounds
  strap: [42, 46, 63],      // strapline text
  light: [245, 247, 250],   // artwork background
};

/* ------------------------------------------------------------- primitives */
// A shape is a predicate (x,y)=>bool in a 512x512 mark space.
const rect = (x0, y0, x1, y1) => (x, y) => x >= x0 && x < x1 && y >= y0 && y < y1;

// parallelogram: horizontal span [x0,x1] sheared by `shear` px per y from yTop.
const slash = (x0, x1, yTop, yBot, shear) => (x, y) => {
  if (y < yTop || y >= yBot) return false;
  const off = ((y - yTop) / (yBot - yTop)) * shear;
  return x >= x0 + off && x < x1 + off;
};

const disc = (cx, cy, r) => (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;

// diamond (rotated square) |x-cx|/hw + |y-cy|/hh <= 1
const diamond = (cx, cy, hw, hh) => (x, y) => Math.abs(x - cx) / hw + Math.abs(y - cy) / hh <= 1;

const or = (...fns) => (x, y) => fns.some((f) => f(x, y));
const and = (...fns) => (x, y) => fns.every((f) => f(x, y));
const not = (fn) => (x, y) => !fn(x, y);

/* ------------------------------------------------------------------- mark */
export function markShapes() {
  const stemX0 = 176, stemX1 = 250, topY = 80, botY = 432;
  const barH = 72;                       // stroke weight
  const cx = 340, cy = (topY + botY) / 2; // bowl centre
  const outerR = (botY - topY) / 2;      // 176
  const innerR = outerR - barH;          // 104

  const stem = rect(stemX0, topY, stemX1, botY);
  const topBar = rect(stemX0, topY, cx, topY + barH);
  const botBar = rect(stemX0, botY - barH, cx, botY);
  const bowlOuter = and(disc(cx, cy, outerR), (x) => x >= cx);
  const bowlInner = and(disc(cx, cy, innerR), (x) => x >= cx);
  const bowl = and(bowlOuter, not(bowlInner));

  // two diagonal cuts across the lower stem (the artwork's breaks)
  const cut1 = slash(stemX0 - 8, stemX1 + 8, 300, 330, -34);
  const cut2 = slash(stemX0 - 8, stemX1 + 8, 352, 382, -34);

  const d = and(or(stem, topBar, botBar, bowl), not(cut1), not(cut2));

  // pixel-dissolve squares top-left
  const px = or(
    rect(136, 106, 168, 138),
    rect(100, 144, 124, 168),
    rect(138, 160, 170, 192),
    rect(118, 204, 142, 228),
  );

  // graduation cap in the counter
  const capTop = diamond(316, 232, 96, 44);
  const capBase = and(rect(262, 252, 370, 306), (x, y) => true);
  const tasselLine = rect(398, 236, 406, 300);
  const tasselBall = disc(402, 306, 9);
  const tasselTail = slash(398, 410, 306, 336, 6);
  const cap = or(capTop, capBase, tasselLine, tasselBall, tasselTail);

  return { blue: or(d, px), navy: cap };
}

/* -------------------------------------------------------------- wordmark */
// Heavy geometric glyphs on a 100-tall grid; each returns polygons in local
// coords (0..w, 0..100). `w` is the advance width.
const G = {
  D: { w: 78, polys: [[ [0,0],[46,0],[78,32],[78,68],[46,100],[0,100], [0,0] ], [ [26,26],[42,26],[52,38],[52,62],[42,74],[26,74],[26,26] ]] , hole: 1 },
  A: { w: 80, polys: [[ [28,0],[52,0],[80,100],[54,100],[48,76],[32,76],[26,100],[0,100],[28,0] ], [ [40,30],[45,56],[35,56],[40,30] ]], hole: 1 },
  N: { w: 78, polys: [[ [0,0],[26,0],[52,52],[52,0],[78,0],[78,100],[52,100],[26,48],[26,100],[0,100],[0,0] ]] },
  Q: { w: 84, polys: [[ [30,0],[54,0],[84,30],[84,70],[54,100],[30,100],[0,70],[0,30],[30,0] ], [ [32,26],[52,26],[58,34],[58,66],[52,74],[32,74],[26,66],[26,34],[32,26] ]] , hole: 1 },
  E: { w: 66, polys: [[ [0,0],[66,0],[66,24],[26,24],[26,38],[60,38],[60,62],[26,62],[26,76],[66,76],[66,100],[0,100],[0,0] ]] },
  L: { w: 64, polys: [[ [0,0],[26,0],[26,76],[64,76],[64,100],[0,100],[0,0] ]] },
};
export const GLYPHS = G;

// The blue Q tail-slash (drawn over the Q, offset to its lower right).
export const Q_SLASH = [ [58, 62], [78, 62], [62, 104], [42, 104] ];

export function wordPolygons(text, scale, x0, y0, tracking) {
  const out = [];
  let x = x0;
  for (const ch of text) {
    const g = G[ch];
    if (!g) { x += 40; continue; }
    out.push(...g.polys.map((p) => p.map(([px, py]) => [x + px * scale, y0 + py * scale])));
    x += (g.w + tracking) * scale;
  }
  return { polys: out, width: x - x0 };
}
