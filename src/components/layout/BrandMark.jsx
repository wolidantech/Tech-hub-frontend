import React, { useId } from 'react';
import { INSTITUTE_NAME, BRAND_SHORT, BRAND_TAGLINE } from '../../lib/brand';

/*
 * Typographic placeholder mark for DANQEL DIGITAL INSTITUTE (docs/REBRAND_AUDIT.md
 * §4). A geometric "D" monogram + wordmark — responsive and accessible, and never
 * passed off as the final logo. Swap these components' internals (or the files in
 * public/) when the real artwork lands.
 */

/** The square "D" monogram, matching public/favicon.svg and the generated PNGs. */
export function BrandMonogram({ className = 'h-9 w-9', labelled = false }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} shrink-0`}
      role={labelled ? 'img' : 'presentation'}
      aria-label={labelled ? INSTITUTE_NAME : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x2="1" y2="1">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="#020a1f" />
      <g fill={`url(#${id})`}>
        <rect x="34" y="26" width="11" height="48" />
        <path d="M45 26a24 24 0 0 1 0 48v-10a14 14 0 0 0 0-28z" />
      </g>
    </svg>
  );
}

/**
 * Nav bar lockup. Shows the compact brand everywhere and adds the second line of
 * the institutional name from `sm:` up, so the long name wraps/scales instead of
 * overflowing the bar or colliding with the controls.
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
 * Institutional lockup for footer / hero / auth screens where the full name is
 * expected. Uses responsive type so "DANQEL DIGITAL INSTITUTE" never overflows.
 */
export function BrandFullLockup({ subline = true }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <BrandMonogram className="h-10 w-10" />
      <span className="min-w-0 leading-none">
        <span className="block font-display font-black leading-none break-words text-white text-[18px] sm:text-[20px] tracking-[0.1em]">
          {BRAND_SHORT}
        </span>
        <span className="block font-display font-bold text-gradient text-[11px] sm:text-[13px] tracking-[0.26em] leading-none mt-1.5">
          DIGITAL INSTITUTE
        </span>
        {subline && (
          <span className="block text-[10px] tracking-[0.22em] text-white/50 leading-none mt-1.5">
            {BRAND_TAGLINE.toUpperCase()}
          </span>
        )}
      </span>
    </span>
  );
}
