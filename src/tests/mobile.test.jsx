// @vitest-environment jsdom
// ============================================================
// Mobile guardrails (Android + iOS)
// ------------------------------------------------------------
// These read the real files instead of rendering them, because every rule here
// is about what a phone browser does with the markup/CSS — viewport units, safe
// areas, keyboard types, PWA icons — which jsdom does not emulate.
// They exist so "make it mobile friendly" cannot quietly regress.
// ============================================================
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..', '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

const filesIn = (dir) => {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else out.push(full.slice(ROOT.length + 1).split('\\').join('/'));
    }
  };
  walk(join(ROOT, dir));
  return out;
};

describe('viewport, safe areas and PWA shell', () => {
  const html = read('index.html');

  it('uses a responsive viewport without disabling pinch zoom', () => {
    const viewport = /<meta name="viewport" content="([^"]+)"/.exec(html)?.[1] || '';
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('viewport-fit=cover'); // iPhone notch / Dynamic Island
    expect(viewport).toContain('initial-scale=1');
    // maximum-scale / user-scalable=no is an accessibility failure on phones.
    expect(viewport).not.toMatch(/maximum-scale|user-scalable\s*=\s*no/);
  });

  it('ships a PNG apple-touch-icon, because iOS ignores SVG here', () => {
    const href = /<link rel="apple-touch-icon" href="([^"]+)"/.exec(html)?.[1];
    expect(href, 'apple-touch-icon must be declared for Add to Home Screen').toBe('/apple-touch-icon.png');
    expect(existsSync(join(ROOT, 'public', 'apple-touch-icon.png'))).toBe(true);
  });

  it('declares each mobile meta exactly once', () => {
    const count = (re) => (html.match(re) || []).length;
    expect(count(/name="theme-color"/g)).toBe(1);
    expect(count(/apple-mobile-web-app-capable/g)).toBe(1);
    expect(count(/apple-mobile-web-app-status-bar-style/g)).toBe(1);
  });

  it('manifest offers PNG + maskable icons so Android installers accept it', () => {
    const manifest = JSON.parse(read('public/manifest.webmanifest'));
    expect(manifest.display).toBe('standalone');
    const png = manifest.icons.filter((i) => i.type === 'image/png');
    expect(png.some((i) => i.sizes === '192x192')).toBe(true);
    expect(png.some((i) => i.sizes === '512x512' && i.purpose === 'any')).toBe(true);
    expect(png.some((i) => i.purpose === 'maskable')).toBe(true);
    for (const icon of png) {
      expect(existsSync(join(ROOT, 'public', icon.src.replace(/^\//, ''))), `${icon.src} must exist`).toBe(true);
    }
  });

  it('bumps the offline cache so installed shells pick up this change', () => {
    expect(read('public/sw.js')).toMatch(/const CACHE = 'wdth-v[3-9]'/);
  });
});

describe('layout rules that only matter on a phone', () => {
  const css = read('src/index.css');

  it('keeps the document from growing to the width of its content', () => {
    expect(css).toMatch(/min-width:\s*320px/);
    expect(css).toMatch(/overflow-x:\s*clip/);
    expect(css).toMatch(/text-size-adjust:\s*100%/); // iOS landscape font inflation
  });

  it('sizes dialogs against the visible viewport, not the tall one', () => {
    expect(css).toMatch(/\.dialog-panel\s*\{[^}]*max-height:\s*88vh/);
    expect(css).toMatch(/@supports \(max-height: 100dvh\)\s*\{\s*\.dialog-panel\s*\{[^}]*max-height:\s*88dvh/);
    expect(css).toMatch(/\.dialog-panel\s*\{[^}]*env\(safe-area-inset-bottom\)/);
  });

  it('neutralises stuck hover transforms on touch screens', () => {
    expect(css).toMatch(/@media \(hover: none\), \(pointer: coarse\)/);
  });

  it('respects reduced motion (iOS Reduce Motion / Android remove animations)', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  it('forces 16px form text for coarse pointers so iOS does not zoom', () => {
    // There are two coarse-pointer blocks (tap targets, then font size), so walk
    // back from the rule to the @media that actually wraps it.
    const at = css.indexOf('font-size: 16px !important');
    expect(at, 'the 16px input rule is missing').toBeGreaterThan(-1);
    const before = css.slice(0, at);
    const mediaStart = before.lastIndexOf('@media');
    const enclosing = mediaStart === -1 ? '' : before.slice(mediaStart, before.indexOf('{', mediaStart));
    expect(enclosing).toMatch(/\(pointer: coarse\)/);
    expect(enclosing).toMatch(/max-width: 767px/);
    expect(css.slice(at - 60, at)).toMatch(/input, textarea, select\s*\{\s*$/);
  });

  it('gives tap targets on coarse pointers', () => {
    expect(css).toMatch(/min-height: 44px/);
    expect(css).toMatch(/@media \(max-width: 767px\), \(pointer: coarse\)/);
  });
});

describe('no vh-capped dialogs left behind', () => {
  it('uses dialog-panel instead of max-h-[NNvh] in components', () => {
    const offenders = filesIn('src')
      .filter((f) => f.endsWith('.jsx'))
      .filter((f) => /max-h-\[\d+vh\]/.test(read(f)));
    expect(offenders, `use .dialog-panel (vh hides content behind mobile browser chrome): ${offenders.join(', ')}`).toEqual([]);
  });

  it('keeps fixed full-height panels on dvh', () => {
    // min-h-screen is fine — content flows. A fixed panel measured in vh clips.
    expect(read('src/pages/Learn.jsx')).toMatch(/h-\[100dvh\]/);
    expect(read('src/components/layout/Navbar.jsx')).toMatch(/calc\(100dvh-72px-env\(safe-area-inset-top\)\)/);
  });
});

describe('mobile keyboards and autofill', () => {
  const authFiles = [
    'src/pages/Login.jsx',
    'src/pages/Register.jsx',
    'src/pages/AdminLogin.jsx',
    'src/pages/ForgotPassword.jsx',
    'src/pages/UpdatePassword.jsx',
  ];

  it('labels every auth field so password managers and Android autofill work', () => {
    for (const f of authFiles) {
      // /[^>]*> would stop at the `=>` in onChange handlers, so match to the tag's
      // own "/>" — tolerant of the multi-line inputs AdminLogin uses.
      const tags = (read(f).match(/<input\b[\s\S]*?\/>/g) || []).filter((t) => /placeholder=/.test(t));
      expect(tags.length, `${f} should contain auth inputs`).toBeGreaterThan(0);
      for (const tag of tags) {
        expect(tag, `${f}: an input has no autoComplete`).toMatch(
          /autoComplete="(username|email|name|tel|current-password|new-password|off)"/
        );
      }
    }
  });

  it('turns autocorrect and capitalisation off where they corrupt values', () => {
    // Emails, coupon codes, transfer references and certificate IDs must never be
    // "helpfully" corrected into "User@Gmail.Com" or "Tmf-123".
    const risky = /placeholder="(Email address|Email Address|Admin Email|ENTER COUPON|e\.g\. TRF-[^"]*|Certificate ID[^"]*)"/;
    let checked = 0;
    for (const f of ['src/pages/Login.jsx', 'src/pages/Register.jsx', 'src/pages/AdminLogin.jsx', 'src/pages/Enroll.jsx', 'src/pages/VerifyCertificate.jsx']) {
      for (const tag of read(f).match(/<input\b[\s\S]*?\/>/g) || []) {
        if (!risky.test(tag)) continue;
        checked++;
        expect(tag, `${f}: ${tag.slice(0, 90)}`).toMatch(/autoCapitalize="(none|characters)"/);
        expect(tag).toMatch(/(autoCorrect="off"|spellCheck=\{false\})/);
      }
    }
    expect(checked).toBeGreaterThan(3);
  });

  it('asks for the right keyboard on tel and numeric fields', () => {
    const enroll = read('src/pages/Enroll.jsx');
    expect(enroll).toMatch(/placeholder="0815\.\.\."[\s\S]{0,200}?inputMode="tel"/);
    expect(enroll).toMatch(/inputMode="numeric"/);
    expect(read('src/pages/Contact.jsx')).toMatch(/inputMode="tel"/);
  });

  it('moves focus with the return key instead of submitting early', () => {
    const register = read('src/pages/Register.jsx');
    expect((register.match(/enterKeyHint=/g) || []).length).toBeGreaterThanOrEqual(4);
  });
});

describe('clipboard', () => {
  it('never calls navigator.clipboard outside the helper', () => {
    const offenders = filesIn('src')
      .filter((f) => /\.(jsx|mjs|js)$/.test(f) && !f.endsWith('lib/utils.js'))
      .filter((f) => !f.startsWith('src/tests/')) // this file names the API on purpose
      .filter((f) => /navigator\.clipboard/.test(read(f)));
    expect(offenders, `use copyText() from lib/utils for Android/iOS fallbacks: ${offenders.join(', ')}`).toEqual([]);
  });
});

describe('no horizontal overflow at 360px (small Android + iPhone SE)', () => {
  // Why a source-level rule: a 360px-wide phone (Galaxy A0x/A1x, iPhone SE) is the
  // narrowest thing a student here will open the site on. The page cannot scroll
  // sideways — html/body are clip — which means anything wider than the viewport is
  // NOT reachable, it is simply cut off. So "nothing is wider than the viewport"
  // has to be a fact about the markup, not something a human remembers to check.
  const CRITICAL = [
    'src/pages/Courses.jsx',
    'src/pages/CourseDetails.jsx',
    'src/pages/Learn.jsx',
    'src/pages/AIPage.jsx',
    'src/components/dantech/DanTechAI.jsx',
    'src/components/layout/Navbar.jsx',
    'src/components/layout/Footer.jsx',
    'src/components/course/CourseCard.jsx',
  ];
  const VIEWPORT = 360;
  const GUTTER = 20; // px of container padding a phone page can afford

  // Escape hatches, each one a deliberate decision rather than a miss:
  //  - responsive prefix: the utility only applies at >=640/768/1024px
  //  - min(...) clamp: the value is bounded by the viewport itself
  //  - pointer-events-none: a blurred glow, clipped by an overflow-hidden parent
  //  - max-w-full: the element caps itself at the container
  const EXCUSE = /(?:^(?:sm|md|lg|xl):)|\bmin\(|pointer-events-none|max-w-full/;

  it('declares a route root that cannot grow sideways', () => {
    for (const f of ['src/pages/Courses.jsx', 'src/pages/CourseDetails.jsx', 'src/pages/Learn.jsx', 'src/pages/AIPage.jsx']) {
      const lines = read(f).split('\n');
      // The element that owns the page height must carry BOTH guards on the same
      // class list, otherwise a wide child is cut off instead of being prevented.
      const guarded = lines.some(
        (l) => /className="[^"]*(min-h-screen|h-\[100dvh\])[^"]*"/.test(l)
          && /max-w-full/.test(l) && /overflow-x-clip/.test(l),
      );
      expect(guarded, `${f}: page-height root lacks max-w-full + overflow-x-clip`).toBe(true);
    }
  });

  it('has no fixed pixel width wider than a small phone', () => {
    const offenders = [];
    for (const f of CRITICAL) {
      read(f).split('\n').forEach((line, i) => {
        for (const m of line.matchAll(/(?:^|[\s"'`{])(?:(sm|md|lg|xl):)?(?:w|min-w)-\[(\d+)px\]/g)) {
          const px = Number(m[2]);
          if (px <= VIEWPORT - GUTTER) continue;
          if (m[1]) continue; // responsive prefix: applies only on wide screens
          if (EXCUSE.test(line)) continue;
          offenders.push(`${f}:${i + 1} w-[${px}px]`);
        }
      });
    }
    expect(offenders, `elements wider than ${VIEWPORT - GUTTER}px:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('sizes nothing in inline pixel widths (percent or clamp only)', () => {
    const offenders = [];
    for (const f of CRITICAL) {
      const src = read(f);
      for (const m of src.matchAll(/style=\{\{([^}]*)\}\}/g)) {
        const px = m[1].match(/(?:width|minWidth):\s*['"`]?(\d+)px/);
        if (px && Number(px[1]) > VIEWPORT) offenders.push(`${f} inline ${px[1]}px`);
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('keeps chat bubbles fluid so a long URL cannot push the page wide', () => {
    const ai = read('src/pages/AIPage.jsx');
    expect(ai).toMatch(/max-w-\[85%\]|max-w-\[\d+%\]/); // bubble width is a percentage
    expect(ai).toMatch(/break-words/);
    expect(ai).toMatch(/min-w-0/); // flex children shrink below their content
  });

  it('gives every embedded surface an aspect box and a max-width', () => {
    const learn = read('src/pages/Learn.jsx');
    expect(learn).toMatch(/aspect-video/);            // the wrapper reserves the shape
    expect(learn).toMatch(/<video[\s\S]{0,400}object-contain/); // and the file keeps ITS shape
    const css = read('src/index.css');
    const guard = /lesson-body[^{]*(?:video|iframe)[\s\S]{0,400}?(aspect-ratio|max-width)/;
    expect(guard.test(css) || /lesson-body iframe, \.lesson-body embed/.test(css), 'lesson-body media guard').toBe(true);
    expect(css).toMatch(/\.lesson-body video \{[^}]*object-fit:\s*contain/);
    expect(css).toMatch(/\.lesson-body iframe[^}]*aspect-ratio:/);
    expect(css).toMatch(/\.lesson-body img[^}]*max-width:\s*100%/);
  });

  it('lets the curriculum drawer breathe instead of fixing a desktop width', () => {
    const learn = read('src/pages/Learn.jsx');
    expect(learn).toMatch(/w-\[min\(90%,360px\)\]/); // clamped to 90% of the phone
    expect(learn).toMatch(/fixed inset-0/);          // full-screen sheet, not a floating box
    expect(learn).toMatch(/h-\[100dvh\][^"]*lg:h-screen|lg:h-screen[^"]*h-\[100dvh\]|h-\[100dvh\]/);
  });
});
