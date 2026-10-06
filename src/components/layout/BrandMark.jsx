import React from 'react';
import { INSTITUTE_NAME, BRAND_SHORT, BRAND_TAGLINE } from '../../lib/brand';

/*
 * Brand components for DANQEL DIGITAL INSTITUTE. The artwork is the school's
 * official logo, rebuilt as vector geometry by scripts/make-brand-assets.mjs
 * (public/mark.png = the "D + cap" mark, public/logo.png = the full vertical
 * lockup). These components reference those files; swap the files when new
 * artwork lands and every surface updates at once.
 */

/** Square mark, matching the PWA/favicon icons. */
export function BrandMonogram({ className = 'h-9 w-9', labelled = false }) {
  return (
    <img
      src="/mark.png"
      alt={labelled ? INSTITUTE_NAME : ''}
      aria-label={labelled ? INSTITUTE_NAME : undefined}
      aria-hidden={labelled ? undefined : true}
      className={`${className} shrink-0`}
      draggable={false}
    />
  );
}

/**
 * Nav bar lockup. Compact DANQEL everywhere; the second line of the institutional
 * name appears from `sm:` up so the long name can never overflow the bar.
 */
export function BrandNavLockup() {
  return (
    <span className="flex min-w-0 items-center gap-2.5 sm:gap-3" title={INSTITUTE_NAME}>
      <BrandMonogram className="h-9 w-9 sm:h-10 sm:w-10" />
      <span className="min-w-0 leading-none">
        <span className="block font-display font-black tracking-[0.16em] text-white text-[15px] sm:text-[17px]">
          {BRAND_SHORT}
        </span>
        <span className="hidden sm:block font-display font-bold text-gradient text-[10px] tracking-[0.24em] leading-none mt-1">
          DIGITAL INSTITUTE
        </span>
      </span>
    </span>
  );
}

/**
 * Institutional lockup (footer / hero / auth): the full vertical logo image,
 * scaled responsively so it never overflows.
 */
export function BrandFullLockup({ className = 'h-24 w-auto' }) {
  return (
    <img
      src="/logo.png"
      alt={INSTITUTE_NAME}
      aria-label={INSTITUTE_NAME}
      title={BRAND_TAGLINE}
      className={`${className} max-w-full shrink-0`}
      draggable={false}
    />
  );
}
