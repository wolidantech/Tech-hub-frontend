// Certificate suite: the public verifier must show the FULL holder name
// (owner requirement, no masking), the luxury certificate must carry the new
// director signature + verification code, and the print/mobile CSS must exist.
// @vitest-environment jsdom
import React from 'react';
import { readFileSync } from 'fs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const mocks = vi.hoisted(() => ({ courses: {}, user: null }));
vi.mock('../context/CourseContext', () => ({ useCourses: () => mocks.courses }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: mocks.user }) }));

import VerifyCertificate from '../pages/VerifyCertificate';
import CertificateView from '../pages/CertificateView';

const CERT = {
  found: true, status: 'valid', studentName: 'Adaeze Okafor',
  courseName: 'AI Video Content Creation', issueDate: '2026-08-01T00:00:00Z',
  certificateId: 'WDTH-2026-93E108', verificationCode: 'WDTH-ABCD-1234',
  issuedBy: 'WOLI DAN TECH HUB',
};

class FakeResizeObserver { observe() {} unobserve() {} disconnect() {} }

beforeEach(() => {
  cleanup();
  global.ResizeObserver = FakeResizeObserver;
  window.scrollTo = vi.fn();
  mocks.user = { id: 'student', fullName: 'Adaeze Okafor' };
  mocks.courses = { verifyCertificate: vi.fn().mockResolvedValue(CERT) };
});

const verifier = (path = '/verify-certificate') => (
  <MemoryRouter initialEntries={[path]}>
    <Routes><Route path="/verify-certificate" element={<VerifyCertificate />} /></Routes>
  </MemoryRouter>
);

const certificatePage = () => (
  <MemoryRouter initialEntries={['/certificate/WDTH-2026-93E108']}>
    <Routes><Route path="/certificate/:id" element={<CertificateView />} /></Routes>
  </MemoryRouter>
);

describe('Public certificate verifier', () => {
  it('shows the FULL holder name on ?code= deep links — never a masked name', async () => {
    render(verifier('/verify-certificate?code=WDTH-2026-93E108'));
    expect(await screen.findByText('Adaeze Okafor')).toBeTruthy();
    expect(screen.queryByText(/A\*+/)).toBeNull();
    expect(document.body.textContent).not.toContain('***');
  });

  it('shows the verification code returned by the RPC', async () => {
    render(verifier('/verify-certificate?code=WDTH-2026-93E108'));
    expect(await screen.findByText('WDTH-ABCD-1234')).toBeTruthy();
  });

  it('still blocks revoked certificates', async () => {
    mocks.courses.verifyCertificate = vi.fn().mockResolvedValue({ ...CERT, status: 'revoked' });
    render(verifier('/verify-certificate?code=WDTH-2026-93E108'));
    expect(await screen.findByText('Certificate Revoked')).toBeTruthy();
    expect(screen.queryByText('Valid Certificate')).toBeNull();
  });
});

describe('Luxury certificate page', () => {
  it('renders holder, course, real verification code and the new director signature', async () => {
    render(certificatePage());
    expect((await screen.findAllByText('Adaeze Okafor')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('AI Video Content Creation')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/WDTH-ABCD-1234/)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/Olowoake Daniel Ayomide/)).length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toContain('***');
  });

  it('uses the repo logo asset in the masthead (gold monogram only as fallback)', async () => {
    render(certificatePage());
    const logo = await screen.findByAltText('WOLI DAN TECH HUB');
    expect(logo.getAttribute('src')).toBe('/logo.svg');
  });

  it('builds the QR code locally for the verification link (no external QR service)', async () => {
    render(certificatePage());
    const img = await screen.findByAltText('Certificate verification QR code');
    await waitFor(() => expect(img.getAttribute('src')).toMatch(/^data:image\/png/));
  });
});

describe('Certificate source & style audits', () => {
  const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

  it('no "Woli Dan" director signature survives; instructor credits untouched', () => {
    const view = read('pages/CertificateView.jsx');
    expect(view).toContain('Olowoake Daniel Ayomide');
    expect(view).not.toMatch(/Woli Dan<\/span>/);
    expect(view).not.toContain('***');
    // instructor credits live in the data files and must stay
    expect(read('data/courses.js')).toContain('instructor: "Woli Dan"');
  });

  it('prints as A4 landscape with exact colors and hidden chrome', () => {
    const css = read('index.css');
    expect(css).toContain('@page { size: A4 landscape; margin: 0; }');
    expect(css).toContain('print-color-adjust: exact');
    expect(css).toContain('nav, footer, .no-print { display: none !important; }');
  });

  it('scales the fixed certificate sheet instead of overflowing on small screens', () => {
    const view = read('pages/CertificateView.jsx');
    expect(view).toContain('ResizeObserver');
    expect(view).toContain('Math.min(1, el.clientWidth / CERT_W)');
  });
});
