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
  issuedBy: 'DANQEL DIGITAL INSTITUTE',
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
    const logo = await screen.findByAltText('DANQEL DIGITAL INSTITUTE');
    expect(logo.getAttribute('src')).toBe('/mark.png');
  });

  it('prints both signatures, the completion date and the schedule ID when the data has them', async () => {
    mocks.courses.verifyCertificate = vi.fn().mockResolvedValue({
      ...CERT,
      completionDate: '2026-10-22T00:00:00Z',
      scheduleId: 'DH-2026-AI-01',
      programDuration: '15-week Bootcamp',
      validityMonths: 24,
    });
    render(certificatePage());
    // Two signatories: Head of Learning & Programs and Director.
    expect((await screen.findAllByText(/HEAD OF LEARNING & PROGRAMS/)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/^DIRECTOR$/)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/DH-2026-AI-01/)).length).toBeGreaterThan(0);
    expect((await screen.findAllByText(/15-week Bootcamp/)).length).toBeGreaterThan(0);
    // The same person signs both lines, so the name legitimately appears twice.
    expect((await screen.findAllByText('Olowoake Daniel Ayomide')).length).toBe(2);
  });

  it('builds the QR code locally for the verification link (no external QR service)', async () => {
    render(certificatePage());
    const img = await screen.findByAltText('Certificate verification QR code');
    await waitFor(() => expect(img.getAttribute('src')).toMatch(/^data:image\/png/));
  });
});

describe('Certificate source & style audits', () => {
  const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

  it('director name survives the rebrand; old brand does not; instructor credits updated', () => {
    const view = read('pages/CertificateView.jsx');
    // The signatory is a real person, preserved through the rebrand.
    expect(view).toContain('Olowoake Daniel Ayomide');
    // The institution name now comes from the single brand constant...
    expect(view).toContain('INSTITUTE_NAME');
    // ...whose value is the new brand, so it still prints in full.
    expect(read('lib/brand.js')).toContain("INSTITUTE_NAME = 'DANQEL DIGITAL INSTITUTE'");
    expect(view).not.toMatch(/Woli Dan/i);
    expect(view).not.toContain('***');
    // instructor credits live in the data files under the new faculty label
    expect(read('data/courses.js')).toContain('instructor: "DANQEL Faculty"');
  });

  it('the sheet is white paper with the full-width navy verification band, like the reference', () => {
    const view = read('pages/CertificateView.jsx');
    // White sheet: the PNG export must be backed with white, not the old navy.
    expect(view).toContain("backgroundColor: '#ffffff'");
    expect(view).toContain("linear-gradient(168deg, #ffffff");
    // The band runs edge to edge at the bottom of the fixed canvas.
    expect(view).toContain('const BAND_TOP =');
    expect(view).toContain('height: CERT_H - BAND_TOP');
    // Light-paper print output.
    expect(read('index.css')).toContain('html, body { background: #ffffff !important; }');
  });

  it('never claims an accreditation the institute does not hold', () => {
    // The reference artwork carries a US accreditation line and an eagle seal.
    // DANQEL has no such accreditation on record, so the sheet must not print
    // one — the crest in that position is the institute's own mark.
    const view = read('pages/CertificateView.jsx');
    expect(view).not.toMatch(/American Council of Training/i);
    expect(view).not.toMatch(/accredited/i);
    expect(view).not.toMatch(/TechCrush/i);
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
