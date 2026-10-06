// @vitest-environment jsdom
// Rebrand guard-rails for DANQEL DIGITAL INSTITUTE.
//
// These tests make the rebrand stick and stop regressions:
//   1. the retired brand never reappears in user-facing code or assets;
//   2. the shell metadata, manifest and PWA names are the new brand;
//   3. the brand components expose the full name to assistive tech and stay
//      compact/responsive so the long name cannot overflow the nav;
//   4. the JAMB exam contract and typed errors survived the rebrand untouched.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrandMonogram, BrandNavLockup, BrandFullLockup } from '../components/layout/BrandMark';
import { INSTITUTE_NAME, BRAND_SHORT, AI_ASSISTANT_NAME, normalizeIssuer } from '../lib/brand';

const ROOT = process.cwd(); // vitest runs from the repo root
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

/* ---------------------------------------------------------------- file scan */
const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (['.js', '.jsx'].includes(extname(name))) out.push(full);
  }
  return out;
};

// Deliberately-preserved strings that legitimately contain the old brand but are
// integration details, not user-facing copy (docs/REBRAND_AUDIT.md §2).
const stripPreserved = (text) => text
  .replace(/[\w.+-]+@wolidantech\.com/gi, '')                 // live mailboxes
  .replace(/wolidantech\/Tech-hub-backend/gi, '')             // factual repo path
  .replace(/LUNA ENTRY SERVICES- WOLI DAN TECH HUB/g, '')     // bank-registered name
  .replace(/VITE_DANTECH_ENDPOINT/g, '');                     // gateway env var

const FORBIDDEN = [/woli[ _-]?dan/i, /wolidan/i, /danqel academy/i, /danqel school/i, /danqel digital school/i];

// Files that are the documented home of preserved values / forbid-assertions and
// are therefore exempt from the blanket scan.
const SCAN_EXEMPT = new Set([
  'src/lib/brand.js',            // holds bank name, legacy emails, LEGACY_ISSUERS
  'src/tests/certificate.test.jsx', // asserts the old brand is gone
  'src/tests/brand.test.jsx',    // this file
]);

describe('brand identity', () => {
  it('exposes the official names', () => {
    expect(INSTITUTE_NAME).toBe('DANQEL DIGITAL INSTITUTE');
    expect(BRAND_SHORT).toBe('DANQEL');
    expect(AI_ASSISTANT_NAME).toBe('DANQEL AI');
  });

  it('the retired brand is gone from every user-facing source and asset', () => {
    const offenders = [];
    const check = (rel) => {
      if (SCAN_EXEMPT.has(rel)) return;
      const text = stripPreserved(read(rel));
      for (const re of FORBIDDEN) {
        if (re.test(text)) offenders.push(`${rel} (${re})`);
      }
    };
    for (const rel of ['index.html', 'public/manifest.webmanifest', 'public/favicon.svg', 'public/logo.svg', 'public/sw.js']) {
      check(rel);
    }
    for (const full of walk(join(ROOT, 'src'))) {
      check(full.replace(ROOT, '').replace(/^\//, ''));
    }
    expect(offenders).toEqual([]);
  });

  it('shell metadata carries the new institutional name', () => {
    const html = read('index.html');
    expect(html).toContain('<title>DANQEL DIGITAL INSTITUTE |');
    expect(html).toContain('og:site_name" content="DANQEL DIGITAL INSTITUTE"');
    expect(html).toContain('apple-mobile-web-app-title" content="DANQEL"');
    expect(html).toContain('"name": "DANQEL DIGITAL INSTITUTE"');
    expect(html).not.toMatch(/woli/i);

    const manifest = JSON.parse(read('public/manifest.webmanifest'));
    expect(manifest.name).toContain('DANQEL DIGITAL INSTITUTE');
    expect(manifest.short_name).toBe('DANQEL');
  });

  it('brand components are accessible and keep the nav compact', () => {
    render(<div><BrandMonogram labelled /><BrandNavLockup /><BrandFullLockup /></div>);
    // The full institutional name is reachable by assistive tech and in the DOM.
    expect(screen.getAllByLabelText(INSTITUTE_NAME).length).toBeGreaterThan(0);
    expect(screen.getAllByText('DIGITAL INSTITUTE').length).toBeGreaterThan(0);
    expect(screen.getAllByText(BRAND_SHORT).length).toBeGreaterThan(0);
  });

  it('legacy issuers stored in the database display as the new institute', () => {
    expect(normalizeIssuer('WOLI DAN TECH HUB')).toBe(INSTITUTE_NAME);
    expect(normalizeIssuer('')).toBe(INSTITUTE_NAME);
    expect(normalizeIssuer(null)).toBe(INSTITUTE_NAME);
    expect(normalizeIssuer('Some Other Body')).toBe('Some Other Body');
  });
});

describe('rebrand does not disturb the JAMB contract', () => {
  it('required exam API paths are unchanged', () => {
    const env = read('.env.example');
    expect(env).toContain('VITE_EXAM_API_SUBJECTS_PATH=/jamb/subjects');
    expect(env).toContain('VITE_EXAM_API_ATTEMPTS_PATH=/jamb/attempts');
    expect(env).toContain('VITE_EXAM_API_SUBMIT_PATH=/jamb/attempts/:attemptId/submit');
    expect(env).toContain('VITE_EXAM_API_HISTORY_PATH=/jamb/attempts');
  });

  it('typed errors, server timer and autosave hooks are intact', () => {
    const api = read('src/lib/jambApi.js');
    for (const sym of ['JambContentNotReadyError', 'JambAccessDeniedError', 'JambApiUnavailableError']) {
      expect(api).toContain(sym);
    }
    const engine = read('src/lib/jambEngine.js');
    expect(engine).toContain("timerSource");
    expect(engine).toContain('wdth.jamb.active'); // local-only fallback key preserved
    expect(engine).toContain('buildAutosave');
  });
});
