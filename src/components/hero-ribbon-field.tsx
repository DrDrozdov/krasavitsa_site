"use client";

import { useId } from "react";

export function HeroRibbonField() {
  const id = useId().replace(/:/g, "");
  const metal = `${id}-metal`;
  const light = `${id}-light`;
  const glow = `${id}-glow`;

  return (
    <div className="hero-ribbon-field" aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="presentation">
        <defs>
          <linearGradient id={metal} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5b1735" />
            <stop offset=".12" stopColor="#fff5fa" />
            <stop offset=".25" stopColor="#ee72aa" />
            <stop offset=".39" stopColor="#6f4cff" />
            <stop offset=".52" stopColor="#ffd4e5" />
            <stop offset=".67" stopColor="#a53f70" />
            <stop offset=".8" stopColor="#fff" />
            <stop offset="1" stopColor="#54102d" />
          </linearGradient>
          <linearGradient id={light} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,.98)" />
            <stop offset=".45" stopColor="rgba(255,255,255,.14)" />
            <stop offset="1" stopColor="rgba(80,9,38,.52)" />
          </linearGradient>
          <filter id={glow} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        <g className="ribbon-shadow" filter={`url(#${glow})`}>
          <path d="M-120 550C170 82 485 70 768 391C1018 673 1322 820 1715 286" />
          <path d="M145 1005C252 533 524 178 906 169C1298 160 1537 437 1394 890" />
          <path d="M-96 280C345 658 630 701 903 449C1116 253 1370 146 1694 375" />
        </g>

        <g className="ribbon-body" fill="none" stroke={`url(#${metal})`} strokeLinecap="round">
          <path className="ribbon-loop ribbon-loop-a" d="M-120 550C170 82 485 70 768 391C1018 673 1322 820 1715 286" />
          <path className="ribbon-loop ribbon-loop-b" d="M145 1005C252 533 524 178 906 169C1298 160 1537 437 1394 890" />
          <path className="ribbon-loop ribbon-loop-c" d="M-96 280C345 658 630 701 903 449C1116 253 1370 146 1694 375" />
          <path className="ribbon-loop ribbon-loop-d" d="M257 -105C458 286 745 576 1110 653C1331 700 1502 644 1700 515" />
        </g>

        <g className="ribbon-specular" fill="none" stroke={`url(#${light})`} strokeLinecap="round">
          <path d="M-120 550C170 82 485 70 768 391C1018 673 1322 820 1715 286" />
          <path d="M145 1005C252 533 524 178 906 169C1298 160 1537 437 1394 890" />
          <path d="M-96 280C345 658 630 701 903 449C1116 253 1370 146 1694 375" />
        </g>
      </svg>
      <span className="ribbon-prism prism-one" />
      <span className="ribbon-prism prism-two" />
      <span className="ribbon-film" />
    </div>
  );
}
