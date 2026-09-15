// Certificate PNG export: the download button must hand the CARD (not the page)
// to html-to-image, embed the webfonts before rasterising, inline external
// artwork (with a locally drawn fallback so nothing renders blank), and then
// share the file where the OS offers "Save to Photos" / download it elsewhere.
// @vitest-environment jsdom
import React from 'react';
import { readFileSync } from 'fs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  courses: {},
  user: null,
  toPng: vi.fn(),
  getFontEmbedCSS: vi.fn(),
}));

vi.mock('../context/CourseContext', () => ({ useCourses: () => mocks.courses }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: mocks.user }) }));
// jsdom has no canvas, so the rasteriser itself is stubbed; every assertion here
// is about WHAT is handed to it and what is done with the bytes it returns.
vi.mock('html-to-image', () => ({
  toPng: (...args) => mocks.toPng(...args),
  getFontEmbedCSS: (...args) => mocks.getFontEmbedCSS(...args),
}));

import {
  BRAND_TILE_DATA_URL,
  captureCertificatePng,
  certificateFileName,
  dataUrlToBlob,
  saveOrShareImage,
} from '../lib/certImage';
import CertificateView from '../pages/CertificateView';

// A plausible PNG payload: big enough to clear the "empty canvas" guard.
const PNG_DATA_URL = `data:image/png;base64,${btoa('0'.repeat(4000))}`;

const CERT = {
  found: true, status: 'valid', studentName: 'Adaeze Okafor',
  courseName: 'AI Video Content Creation', issueDate: '2026-08-01T00:00:00Z',
  certificateId: 'WDTH-2026-93E108', verificationCode: 'WDTH-ABCD-1234',
};

class FakeResizeObserver { observe() {} unobserve() {} disconnect() {} }

const setNav = (key, value) => Object.defineProperty(window.navigator, key, { value, configurable: true });
const clearNav = (key) => { try { delete window.navigator[key]; } catch { setNav(key, undefined); } };

const makeSheet = (html = '') => {
  const node = document.createElement('div');
  node.className = 'cert-sheet';
  node.innerHTML = html;
  // jsdom reports 0 for offsetWidth/Height; the real sheet is the fixed canvas.
  Object.defineProperty(node, 'offsetWidth', { value: 1120, configurable: true });
  Object.defineProperty(node, 'offsetHeight', { value: 792, configurable: true });
  document.body.appendChild(node);
  return node;
};

beforeEach(() => {
  cleanup();
  global.ResizeObserver = FakeResizeObserver;
  window.scrollTo = vi.fn();
  mocks.user = { id: 'student', fullName: 'Adaeze Okafor' };
  mocks.courses = { verifyCertificate: vi.fn().mockResolvedValue(CERT) };
  mocks.toPng = vi.fn().mockResolvedValue(PNG_DATA_URL);
  mocks.getFontEmbedCSS = vi.fn().mockResolvedValue('');
  global.fetch = vi.fn().mockRejectedValue(new Error('offline in tests'));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  clearNav('share');
  clearNav('canShare');
});

/* ------------------------------------------------------------- file naming */

describe('certificateFileName', () => {
  it('uses the certificate ID exactly as the owner specified', () => {
    expect(certificateFileName('WDTH-2026-93E108')).toBe('WOLI-DAN-TECH-HUB-certificate-WDTH-2026-93E108.png');
  });

  it('sanitises hostile/legacy IDs so the download cannot escape a folder', () => {
    expect(certificateFileName('../../etc/passwd')).toBe('WOLI-DAN-TECH-HUB-certificate-etc-passwd.png');
    expect(certificateFileName('  WDTH 2026/01  ')).toBe('WOLI-DAN-TECH-HUB-certificate-WDTH-2026-01.png');
    expect(certificateFileName('')).toBe('WOLI-DAN-TECH-HUB-certificate-certificate.png');
    expect(certificateFileName(undefined).length).toBeLessThan(110);
  });
});

/* ------------------------------------------------------------ data URL/bytes */

describe('dataUrlToBlob', () => {
  it('turns the rendered data URL into PNG bytes without another request', () => {
    const blob = dataUrlToBlob(PNG_DATA_URL);
    expect(blob.type).toBe('image/png');
    expect(blob.size).toBe(4000);
  });

  it('refuses an empty canvas instead of saving a blank file', () => {
    expect(() => dataUrlToBlob('data:,')).toThrow();
    expect(() => dataUrlToBlob('')).toThrow();
  });
});

/* ----------------------------------------------------------------- capture */

describe('captureCertificatePng', () => {
  it('renders the node at the design size with a 3x pixel ratio', async () => {
    mocks.getFontEmbedCSS.mockResolvedValue('@font-face{font-family:"Space Grotesk";src:url(data:font/woff2;base64,AAA) format("woff2")}');
    const node = makeSheet();
    await captureCertificatePng(node);
    const [, options] = mocks.toPng.mock.calls[0];
    expect(options.width).toBe(1120);
    expect(options.height).toBe(792);
    expect(options.pixelRatio).toBe(3);
    expect(options.cacheBust).toBe(true);
    // the sheet's own navy, so a transparent corner can never show as blank
    expect(options.backgroundColor).toBe('#0a1a4a');
    expect(options.style.boxShadow).toBe('none');
    expect(options.fontEmbedCSS).toContain('Space Grotesk');
  });

  it('waits for document.fonts.ready, or the gold serif is captured in a fallback face', async () => {
    const order = [];
    const realFonts = Object.getOwnPropertyDescriptor(document, 'fonts');
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: new Promise((resolve) => setTimeout(() => { order.push('fonts'); resolve(); }, 20)) },
    });
    mocks.toPng.mockImplementation(() => { order.push('toPng'); return Promise.resolve(PNG_DATA_URL); });
    try {
      await captureCertificatePng(makeSheet());
    } finally {
      if (!realFonts) delete document.fonts;
    }
    expect(order).toEqual(['fonts', 'toPng']);
  });

  it('inlines external artwork as data URLs and restores the DOM afterwards', async () => {
    global.fetch = vi.fn().mockImplementation((url) => Promise.resolve({
      ok: true,
      blob: async () => new Blob([`<svg>${url}</svg>`], { type: 'image/svg+xml' }),
    }));
    const node = makeSheet('<img alt="logo" src="/logo.svg"><img alt="qr" src="data:image/png;base64,AAA">');
    const qrBefore = node.querySelector('[alt="qr"]').getAttribute('src');
    let seen = [];
    mocks.toPng.mockImplementation(() => {
      seen = Array.from(node.querySelectorAll('img')).map((i) => i.getAttribute('src'));
      return Promise.resolve(PNG_DATA_URL);
    });
    await captureCertificatePng(node);
    expect(seen[0]).toMatch(/^data:image\/svg\+xml/);  // remote logo was fetched
    expect(seen[1]).toBe(qrBefore);                    // local QR left alone
    expect(node.querySelector('[alt="logo"]').getAttribute('src')).toBe('/logo.svg'); // restored
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(String(global.fetch.mock.calls[0][0])).toContain('_wt='); // cacheBust
    expect(global.fetch.mock.calls[0][1]).toMatchObject({ mode: 'cors', credentials: 'omit' });
  });

  it('swaps in a locally drawn fallback when artwork cannot be fetched, so the export is never blank', async () => {
    const node = makeSheet('<img alt="qr" src="https://api.qrserver.com/qr.png">');
    let srcDuringCapture = '';
    mocks.toPng.mockImplementation(() => {
      srcDuringCapture = node.querySelector('img').getAttribute('src');
      return Promise.resolve(PNG_DATA_URL);
    });
    const out = await captureCertificatePng(node);
    expect(srcDuringCapture).toBe(BRAND_TILE_DATA_URL);
    expect(srcDuringCapture.startsWith('data:image/svg+xml')).toBe(true);
    expect(out.blob.size).toBeGreaterThan(0);
  });

  it('embeds fonts once; if the font CDN is blocked it degrades instead of failing', async () => {
    mocks.getFontEmbedCSS.mockRejectedValue(new Error('fonts blocked'));
    const node = makeSheet();
    await captureCertificatePng(node);
    const [, options] = mocks.toPng.mock.calls[0];
    expect(options.fontEmbedCSS).toBeUndefined();
    expect(options.skipFonts).toBe(true);
  });

  it('reads the font files from the page cache, so the share sheet keeps its user activation', async () => {
    await captureCertificatePng(makeSheet());
    const [, fontOptions] = mocks.getFontEmbedCSS.mock.calls[0];
    expect(fontOptions.cacheBust).toBe(false);
    expect(fontOptions.fetchRequestInit).toMatchObject({ mode: 'cors' });
    // ...while the render itself still asks for cache-busted resources
    expect(mocks.toPng.mock.calls[0][1].cacheBust).toBe(true);
  });

  it('retries at a lower pixel ratio without webfonts when rasterising fails', async () => {
    mocks.toPng = vi.fn()
      .mockRejectedValueOnce(new Error('SecurityError: tainted'))
      .mockResolvedValueOnce(PNG_DATA_URL);
    const out = await captureCertificatePng(makeSheet());
    expect(mocks.toPng).toHaveBeenCalledTimes(2);
    expect(mocks.toPng.mock.calls[1][1]).toMatchObject({ pixelRatio: 2, skipFonts: true });
    expect(out.blob.type).toBe('image/png');
  });

  it('treats an empty canvas as a failure rather than a saved file', async () => {
    mocks.toPng = vi.fn().mockResolvedValue('data:,');
    await expect(captureCertificatePng(makeSheet())).rejects.toThrow();
    expect(mocks.toPng).toHaveBeenCalledTimes(2);
  });

  it('fails loudly when every attempt fails, so the UI can point at Print', async () => {
    mocks.toPng = vi.fn().mockRejectedValue(new Error('no canvas'));
    await expect(captureCertificatePng(makeSheet())).rejects.toThrow('no canvas');
    expect(mocks.toPng).toHaveBeenCalledTimes(2);
  });

  it('refuses to run without the certificate node', async () => {
    await expect(captureCertificatePng(null)).rejects.toThrow(/not on screen/i);
    expect(mocks.toPng).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------- save/share */

describe('saveOrShareImage', () => {
  const shot = () => ({ blob: dataUrlToBlob(PNG_DATA_URL), dataUrl: PNG_DATA_URL, fileName: 'WOLI-DAN-TECH-HUB-certificate-WDTH-2026-93E108.png' });

  it('shares a real File on phones so the sheet offers Save to Photos', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setNav('canShare', ({ files }) => Boolean(files?.[0]));
    setNav('share', share);
    const result = await saveOrShareImage({ ...shot(), title: 'T', text: 'B' });
    expect(result).toBe('shared');
    const payload = share.mock.calls[0][0];
    expect(payload.files[0].name).toBe('WOLI-DAN-TECH-HUB-certificate-WDTH-2026-93E108.png');
    expect(payload.files[0].type).toBe('image/png');
    expect(payload.files[0].size).toBe(4000);
    expect(payload.title).toBe('T');
    expect(payload.text).toBe('B');
    expect(payload.url).toBeUndefined(); // the picture goes out, not the link
  });

  it('treats a closed share sheet as a cancel, not an error, and does not download', async () => {
    setNav('canShare', () => true);
    setNav('share', vi.fn().mockRejectedValue(Object.assign(new Error('cancel'), { name: 'AbortError' })));
    const clicked = vi.spyOn(window.HTMLElement.prototype, 'click');
    expect(await saveOrShareImage(shot())).toBe('dismissed');
    expect(clicked).not.toHaveBeenCalled();
  });

  it('falls back to a file download when file sharing is unavailable', async () => {
    setNav('canShare', () => false);
    let seen = {};
    vi.spyOn(window.HTMLElement.prototype, 'click').mockImplementation(function click() {
      seen = { download: this.getAttribute('download'), href: this.getAttribute('href') };
    });
    const result = await saveOrShareImage(shot());
    expect(result).toBe('saved');
    expect(seen.download).toBe('WOLI-DAN-TECH-HUB-certificate-WDTH-2026-93E108.png');
    expect(seen.href).toMatch(/^(blob:|data:image\/png)/);
  });

  it('still downloads when canShare throws (Android WebViews) or share rejects the file', async () => {
    setNav('canShare', () => { throw new Error('not really'); });
    const clicked = vi.spyOn(window.HTMLElement.prototype, 'click').mockImplementation(() => {});
    expect(await saveOrShareImage(shot())).toBe('saved');
    expect(clicked).toHaveBeenCalledTimes(1);

    setNav('canShare', () => true);
    setNav('share', vi.fn().mockRejectedValue(new Error('NotAllowedError')));
    expect(await saveOrShareImage(shot())).toBe('saved');
    expect(clicked).toHaveBeenCalledTimes(2);
  });

  it('reports failure when even the download cannot be built', async () => {
    setNav('canShare', () => false);
    vi.spyOn(window.HTMLElement.prototype, 'click').mockImplementation(() => { throw new Error('blocked'); });
    expect(await saveOrShareImage({ blob: new Blob([]), dataUrl: '', fileName: 'x.png' })).toBe('failed');
  });
});

/* -------------------------------------------------------------------- page */

const certificatePage = () => (
  <MemoryRouter initialEntries={['/certificate/WDTH-2026-93E108']}>
    <Routes><Route path="/certificate/:id" element={<CertificateView />} /></Routes>
  </MemoryRouter>
);

describe('Certificate page download action', () => {
  it('adds a third action and exports only the certificate card', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    setNav('canShare', ({ files }) => Boolean(files?.[0]));
    setNav('share', share);
    render(certificatePage());
    await screen.findAllByText('Adaeze Okafor'); // the sheet, not the loading glass

    const button = screen.getByRole('button', { name: /Download Image \(PNG\)/ });
    expect(button).toBeTruthy();
    fireEvent.click(button);
    expect(screen.getByText('Downloading…')).toBeTruthy(); // label while it renders

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share.mock.calls[0][0].files[0].name).toBe('WOLI-DAN-TECH-HUB-certificate-WDTH-2026-93E108.png');
    expect(await screen.findByText('Saved ✓')).toBeTruthy();

    // what was handed to the rasteriser is the card and nothing else
    const [node, options] = mocks.toPng.mock.calls[0];
    expect(node.className).toContain('cert-sheet');
    expect(node.textContent).toContain('Adaeze Okafor');
    expect(node.textContent).toContain('AI Video Content Creation');
    expect(node.textContent).toContain('Olowoake Daniel Ayomide');
    expect(node.textContent).toContain('WDTH-ABCD-1234');
    expect(node.querySelector('img[alt="Certificate verification QR code"]')).toBeTruthy();
    expect(node.querySelector('svg')).toBeTruthy(); // seal + frames are inline SVG
    expect(node.textContent).not.toMatch(/Back|Print \/ Download PDF|Certificate Details/);
    expect(options.pixelRatio).toBe(3);
  });

  it('shows the Print fallback message when the export fails', async () => {
    mocks.toPng = vi.fn().mockRejectedValue(new Error('no canvas'));
    render(certificatePage());
    await screen.findAllByText('Adaeze Okafor');
    fireEvent.click(screen.getByRole('button', { name: /Download Image/ }));
    expect(await screen.findByText('Failed, try Print')).toBeTruthy();
  });

  it('leaves Print / Download PDF and the Share link flow untouched', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('cancel'), { name: 'AbortError' }));
    setNav('canShare', () => false);
    setNav('share', share);
    render(certificatePage());
    await screen.findAllByText('Adaeze Okafor');

    fireEvent.click(screen.getByRole('button', { name: /Print \/ Download PDF/ }));
    expect(print).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /^Share$/ }));
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share.mock.calls[0][0].url).toContain('/verify-certificate?code=WDTH-ABCD-1234');
    expect(share.mock.calls[0][0].files).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ audits */

describe('Export source audits', () => {
  const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
  const readRoot = (p) => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');

  it('html-to-image is the only rendering dependency added', () => {
    const pkg = JSON.parse(readRoot('package.json'));
    expect(Object.keys(pkg.dependencies)).toContain('html-to-image');
    expect(pkg.dependencies['html-to-image']).toMatch(/^\^?1\./);
    expect(Object.keys(pkg.dependencies).some((k) => /html2canvas|dom-to-image|puppeteer/.test(k))).toBe(false);
  });

  it('keeps every asset inlined so the PNG matches the screen', () => {
    const lib = read('lib/certImage.js');
    expect(lib).toContain('cacheBust: true');
    expect(lib).toContain('getFontEmbedCSS');
    expect(lib).toMatch(/document\.fonts/);
    expect(lib).not.toMatch(/https?:\/\/api\.qrserver\.com/); // QR is drawn locally by `qrcode`
    expect(read('pages/CertificateView.jsx')).toContain('ref={certRef}');
  });
});
