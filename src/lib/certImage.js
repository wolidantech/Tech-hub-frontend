/**
 * Certificate image export (PNG).
 *
 * Why this exists as its own module: the whole point of the export is that the
 * PNG must be indistinguishable from what is on screen, and the traps that make
 * that hard (webfonts not embedded, a remote image rendering blank, the page
 * scaling the fixed sheet down on phones) are all rendering details that have
 * nothing to do with the certificate itself. Kept here so the page stays a page
 * and the traps are documented next to the code that handles them.
 *
 * Pipeline: html-to-image renders a CLONE of the node into an SVG <foreignObject>,
 * then paints that SVG into a canvas. Two consequences drive the design:
 *   1. Anything the browser must fetch inside the SVG (webfont files, remote
 *      <img> sources) is silently dropped unless it is inlined as a data URL
 *      first — that shows up as blank gold text / a blank QR square, not an error.
 *      So fonts are embedded up front and every non-inline image is fetched to a
 *      data URL ourselves, with a locally drawn brand tile if that fetch fails.
 *   2. Because the SVG reaches the canvas as a data URL, the canvas can never be
 *      *tainted* — a blocked resource is invisible rather than fatal. The
 *      fallback above means it is neither.
 */
import { getFontEmbedCSS, toPng } from 'html-to-image';

const PNG_MIME = 'image/png';
const NAVY = '#0a1a4a';
const GOLD = '#c9a227';
const GOLD_LIGHT = '#e9cf8b';

// 3x the 1120x792 design canvas = 3360x2376 px — phone-crisp and ~300dpi A4
// landscape, i.e. good enough to print from the PNG itself.
const PIXEL_RATIO = 3;
const FALLBACK_RATIO = 2;

/**
 * Stand-in for any artwork that cannot be inlined: drawn from the same gold-on-
 * navy palette as the sheet, as an SVG data URL (no canvas, no network, no CORS,
 * so it works inside the serialized SVG where a real file would not).
 */
export const BRAND_TILE_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">`
  + `<rect width="128" height="128" fill="${NAVY}"/><rect x="7" y="7" width="114" height="114" fill="none" stroke="${GOLD}" stroke-width="3"/>`
  + `<path d="m34 44 12 42 18-28 18 28 12-42" fill="none" stroke="${GOLD_LIGHT}" stroke-width="7" stroke-linejoin="round"/>`
  + `<text x="64" y="112" text-anchor="middle" font-family="Georgia,serif" font-size="11" letter-spacing="2" fill="${GOLD}">WOLI DAN</text></svg>`,
)}`;

const isInline = (src) => /^(data:|blob:)/i.test(String(src || ''));
const absUrl = (src) => {
  try { return new URL(src, document.baseURI).href; } catch { return String(src || ''); }
};

const fetchAsDataUrl = async (url) => {
  if (typeof fetch !== 'function') throw new Error('fetch is unavailable');
  // cacheBust: a QR/image endpoint that was served once without CORS still must
  // not be reused from the disk cache, where the response has no CORS headers.
  const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}_wt=${Date.now()}`, {
    mode: 'cors',
    credentials: 'omit',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the image bytes'));
    reader.readAsDataURL(blob);
  });
};

/** data URL -> Blob, without a second network round-trip through fetch(). */
export function dataUrlToBlob(dataUrl) {
  const [meta, payload] = String(dataUrl || '').split(',');
  if (!payload) throw new Error('No image data was produced');
  const mime = /data:([^;,]+)/.exec(meta)?.[1] || PNG_MIME;
  const raw = globalThis.atob ? atob(payload) : '';
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Swap every image inside `root` for an inlined data URL and hand back a restore.
 * React never re-renders these `src` attributes while we are exporting (the
 * values come from unchanged state), the replacement is the same pixels, and the
 * restore runs in a `finally`, so the live certificate is untouched.
 */
async function inlineImages(root) {
  const imgs = Array.from(root.querySelectorAll?.('img') || [])
    .filter((img) => {
      const src = img.getAttribute('src');
      return Boolean(src) && !isInline(src);
    });
  if (!imgs.length) return () => {};

  const inlined = await Promise.all(imgs.map(async (img) => {
    try { return await fetchAsDataUrl(absUrl(img.getAttribute('src'))); } catch { return BRAND_TILE_DATA_URL; }
  }));

  const previous = imgs.map((img) => ({ src: img.getAttribute('src'), srcset: img.getAttribute('srcset') }));
  imgs.forEach((img, i) => {
    img.removeAttribute('srcset'); // srcset would win over the swapped src
    img.setAttribute('src', inlined[i]);
  });
  return () => imgs.forEach((img, i) => {
    const prev = previous[i];
    if (prev.srcset != null) img.setAttribute('srcset', prev.srcset); else img.removeAttribute('srcset');
    img.setAttribute('src', prev.src);
  });
}

// Webfonts must be settled BEFORE the clone is made, otherwise the gold serif
// masthead and the holder name are captured in a fallback face. Capped so a
// stalled font CDN slows the button down instead of hanging it forever.
const waitForFonts = async (ms = 2500) => {
  const ready = document.fonts?.ready;
  if (!ready || typeof ready.then !== 'function') return;
  await Promise.race([ready.catch(() => {}), new Promise((r) => setTimeout(r, ms))]);
};

/**
 * Render `node` (the certificate sheet only) to a PNG blob + data URL.
 * Throws only if every attempt failed — callers show a retry message.
 */
export async function captureCertificatePng(node, { pixelRatio = PIXEL_RATIO } = {}) {
  if (!node) throw new Error('The certificate is not on screen yet.');
  await waitForFonts();

  // The sheet is a fixed canvas the page scales to fit; offsetWidth/Height ignore
  // the ancestor transform, so the export is always the full design size.
  const width = node.offsetWidth || undefined;
  const height = node.offsetHeight || undefined;
  const restore = await inlineImages(node);

  const base = {
    width,
    height,
    cacheBust: true,
    fetchRequestInit: { mode: 'cors', credentials: 'omit' },
    // Navy behind the sheet's own gradient: never a transparent PNG, and the
    // screen-only drop shadow is clipped so no dark bleed lands in the image.
    backgroundColor: NAVY,
    style: { boxShadow: 'none' },
  };

  // Embed the webfonts once, here, so a blocked font host degrades to the same
  // system faces the page falls back to instead of failing the export. Their
  // files are deliberately NOT cache-busted: the page just rendered with them, and
  // re-fetching ~70 subset files would push navigator.share() past the
  // user-activation window that iOS/Android require for the share sheet.
  const fontEmbedCSS = await Promise.resolve(getFontEmbedCSS(node, {
    fetchRequestInit: base.fetchRequestInit,
    cacheBust: false,
  })).catch(() => '');
  const fonts = fontEmbedCSS ? { fontEmbedCSS } : { skipFonts: true };

  const attempts = [
    { ...base, ...fonts, pixelRatio },
    { ...base, pixelRatio: FALLBACK_RATIO, skipFonts: true },
  ];

  try {
    let lastError;
    for (const options of attempts) {
      try {
        const dataUrl = await toPng(node, options);
        const blob = dataUrlToBlob(dataUrl);
        // A canvas that was refused (memory limits, oversized contexts) hands back
        // an empty data URL — treat it as a failed attempt, never as a "success".
        if (!blob.size || dataUrl.length < 64) throw new Error('The exported image was empty');
        return { blob, dataUrl };
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('Could not render the certificate');
  } finally {
    restore();
  }
}

/** `WOLI-DAN-TECH-HUB-certificate-WDTH-2026-93E108.png` */
export function certificateFileName(certificateId) {
  const id = String(certificateId || '')
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 80);
  return `WOLI-DAN-TECH-HUB-certificate-${id || 'certificate'}.png`;
}

/** Desktop path: an <a download> click, object URL first, data URL if unavailable. */
function triggerAnchorDownload({ blob, dataUrl, fileName }) {
  let objectUrl = '';
  try {
    objectUrl = URL.createObjectURL?.(blob) || '';
  } catch {
    objectUrl = '';
  }
  const anchor = document.createElement('a');
  anchor.href = objectUrl || dataUrl;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  anchor.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0';
  document.body.appendChild(anchor);
  anchor.click();
  // Revoking too early aborts the transfer on Android Chrome, so give it a beat.
  setTimeout(() => {
    anchor.remove();
    if (objectUrl) { try { URL.revokeObjectURL(objectUrl); } catch { /* already gone */ } }
  }, 4000);
}

/**
 * Save the PNG where the device expects to save it.
 *   'shared'    — the OS sheet opened (phones: Save to Photos / Files / WhatsApp)
 *   'saved'     — a file download was triggered (desktop)
 *   'dismissed' — the user closed the sheet; not an error
 *   'failed'    — nothing worked; the UI points at Print / Download PDF
 */
export async function saveOrShareImage({ blob, dataUrl, fileName, title = '', text = '' }) {
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const file = typeof File === 'function' ? new File([blob], fileName, { type: blob.type || PNG_MIME }) : null;

  // Level 2 sharing (files) is what puts "Save Image"/"Save to Photos" in front
  // of a phone. canShare throws on some in-app browsers instead of returning
  // false, so it is treated as "no" whenever it does not say "yes".
  let canShareFiles = false;
  try { canShareFiles = Boolean(file && nav?.canShare?.({ files: [file] })); } catch { canShareFiles = false; }

  if (canShareFiles) {
    try {
      await nav.share({ files: [file], title, text });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'dismissed'; // user cancelled the sheet
      // Android WebViews and older iOS report support then reject the file,
      // so the download below is still the right thing to try.
    }
  }

  try {
    triggerAnchorDownload({ blob, dataUrl, fileName });
    return 'saved';
  } catch {
    return 'failed';
  }
}
