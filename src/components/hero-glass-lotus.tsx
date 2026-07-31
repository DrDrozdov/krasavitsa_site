"use client";

import { useId } from "react";

export function HeroGlassLotus({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const petal = `${id}-hero-petal`;
  const edge = `${id}-hero-edge`;
  const core = `${id}-hero-core`;
  const glow = `${id}-hero-glow`;

  return (
    <div className={["hero-glass-lotus", className].filter(Boolean).join(" ")} aria-hidden="true">
      <span className="hero-lotus-aura" />
      <svg className="hero-lotus-svg" viewBox="0 0 640 640" role="presentation">
        <defs>
          <linearGradient id={petal} x1="0.08" y1="0.02" x2="0.92" y2="0.98">
            <stop offset="0" stopColor="#fff" stopOpacity="0.88" />
            <stop offset="0.2" stopColor="#ffd8e5" stopOpacity="0.42" />
            <stop offset="0.46" stopColor="#9d244e" stopOpacity="0.2" />
            <stop offset="0.7" stopColor="#fff8fb" stopOpacity="0.62" />
            <stop offset="1" stopColor="#531024" stopOpacity="0.36" />
          </linearGradient>
          <linearGradient id={edge} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.96" />
            <stop offset="0.45" stopColor="#f7a7c3" stopOpacity="0.78" />
            <stop offset="1" stopColor="#5b1029" stopOpacity="0.76" />
          </linearGradient>
          <radialGradient id={core} cx="42%" cy="28%" r="76%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.98" />
            <stop offset="0.38" stopColor="#f7a2bf" stopOpacity="0.84" />
            <stop offset="1" stopColor="#7a1738" stopOpacity="0.96" />
          </radialGradient>
          <filter id={glow} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
        </defs>

        <ellipse className="hero-lotus-shadow" cx="320" cy="474" rx="154" ry="44" filter={`url(#${glow})`} />

        <g className="hero-lotus-bloom">
          <path
            className="hero-petal hero-petal-outer-left"
            d="M319 500C232 496 141 455 79 366C177 348 264 389 321 468C321 480 321 490 319 500Z"
            fill={`url(#${petal})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-outer-right"
            d="M321 500C408 496 499 455 561 366C463 348 376 389 319 468C319 480 319 490 321 500Z"
            fill={`url(#${petal})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-mid-left"
            d="M319 478C246 437 174 346 170 238C267 277 316 361 319 458V478Z"
            fill={`url(#${petal})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-mid-right"
            d="M321 478C394 437 466 346 470 238C373 277 324 361 321 458V478Z"
            fill={`url(#${petal})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-inner-left"
            d="M320 452C265 392 239 282 280 174C341 244 350 354 320 452Z"
            fill={`url(#${petal})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-inner-right"
            d="M320 452C375 392 401 282 360 174C299 244 290 354 320 452Z"
            fill={`url(#${petal})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-crown"
            d="M320 382C258 320 261 194 320 84C379 194 382 320 320 382Z"
            fill={`url(#${petal})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-cup-left"
            d="M320 488C263 470 215 422 194 355C270 359 312 405 320 488Z"
            fill={`url(#${petal})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-cup-right"
            d="M320 488C377 470 425 422 446 355C370 359 328 405 320 488Z"
            fill={`url(#${petal})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-lotus-core"
            d="M320 498C286 468 285 422 320 384C355 422 354 468 320 498Z"
            fill={`url(#${core})`}
          />
        </g>

        <g className="hero-lotus-glints" fill="none" stroke="#fff" strokeLinecap="round">
          <path d="M122 380C185 373 244 404 293 463" />
          <path d="M518 380C455 373 396 404 347 463" />
          <path d="M293 208C273 281 285 352 314 413" />
          <path d="M347 208C367 281 355 352 326 413" />
          <path d="M320 120C302 184 301 264 320 332" />
        </g>
      </svg>
      <span className="hero-lotus-flare" />
    </div>
  );
}
