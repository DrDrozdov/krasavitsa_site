"use client";

import { useId } from "react";

/**
 * A code-native glass sculpture. Keeping the bloom as SVG paths lets the
 * landing chapter scrub every petal independently without decoding a video
 * or repainting a canvas on each scroll frame.
 */
export function HeroGlassLotus({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const glass = `${id}-lotus-glass`;
  const glassDeep = `${id}-lotus-glass-deep`;
  const glassWarm = `${id}-lotus-glass-warm`;
  const edge = `${id}-lotus-edge`;
  const core = `${id}-lotus-core`;
  const shadow = `${id}-lotus-shadow`;

  return (
    <div className={["hero-glass-lotus", className].filter(Boolean).join(" ")} aria-hidden="true">
      <span className="hero-lotus-aura" />
      <svg className="hero-lotus-svg" viewBox="0 0 720 620" role="presentation">
        <defs>
          <linearGradient id={glass} x1="0.08" y1="0.03" x2="0.92" y2="0.96">
            <stop offset="0" stopColor="var(--lotus-glass-highlight, #fff)" stopOpacity="0.94" />
            <stop offset="0.18" stopColor="var(--lotus-glass-pearl, #ffe7ef)" stopOpacity="0.56" />
            <stop offset="0.48" stopColor="var(--lotus-glass-rose, #d85d8b)" stopOpacity="0.2" />
            <stop offset="0.72" stopColor="var(--lotus-glass-highlight, #fff)" stopOpacity="0.52" />
            <stop offset="1" stopColor="var(--lotus-glass-wine, #681533)" stopOpacity="0.62" />
          </linearGradient>
          <linearGradient id={glassDeep} x1="0.18" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="var(--lotus-glass-highlight, #fff)" stopOpacity="0.76" />
            <stop offset="0.4" stopColor="var(--lotus-glass-rose, #d85d8b)" stopOpacity="0.38" />
            <stop offset="1" stopColor="var(--lotus-glass-wine, #681533)" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id={glassWarm} cx="42%" cy="22%" r="84%">
            <stop offset="0" stopColor="var(--lotus-glass-highlight, #fff)" stopOpacity="0.88" />
            <stop offset="0.42" stopColor="var(--lotus-glass-pearl, #ffe7ef)" stopOpacity="0.48" />
            <stop offset="1" stopColor="var(--lotus-glass-rose, #d85d8b)" stopOpacity="0.58" />
          </radialGradient>
          <linearGradient id={edge} x1="0" y1="0" x2="0.86" y2="1">
            <stop offset="0" stopColor="var(--lotus-glass-highlight, #fff)" stopOpacity="0.98" />
            <stop offset="0.5" stopColor="var(--lotus-glass-pearl, #ffe7ef)" stopOpacity="0.62" />
            <stop offset="1" stopColor="var(--lotus-glass-wine, #681533)" stopOpacity="0.72" />
          </linearGradient>
          <radialGradient id={core} cx="38%" cy="24%" r="78%">
            <stop offset="0" stopColor="var(--lotus-glass-highlight, #fff)" stopOpacity="0.98" />
            <stop offset="0.34" stopColor="var(--lotus-glass-pearl, #ffe7ef)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--lotus-glass-wine, #681533)" stopOpacity="0.98" />
          </radialGradient>
          <filter id={shadow} x="-70%" y="-160%" width="240%" height="420%">
            <feGaussianBlur stdDeviation="21" />
          </filter>
        </defs>

        <ellipse className="hero-lotus-shadow" cx="360" cy="526" rx="178" ry="30" filter={`url(#${shadow})`} />

        <g className="hero-lotus-bloom">
          <path
            className="hero-petal hero-petal-back-left"
            d="M356 500C266 493 156 438 92 338C203 332 300 384 362 469C363 482 361 493 356 500Z"
            fill={`url(#${glassDeep})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-back-right"
            d="M364 500C454 493 564 438 628 338C517 332 420 384 358 469C357 482 359 493 364 500Z"
            fill={`url(#${glassDeep})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-wing-left"
            d="M354 492C273 461 185 371 164 260C269 288 338 369 362 463C362 477 359 486 354 492Z"
            fill={`url(#${glass})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-wing-right"
            d="M366 492C447 461 535 371 556 260C451 288 382 369 358 463C358 477 361 486 366 492Z"
            fill={`url(#${glass})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-outer-left"
            d="M358 512C276 513 176 486 104 414C199 390 297 423 362 484C364 496 363 505 358 512Z"
            fill={`url(#${glassWarm})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-outer-right"
            d="M362 512C444 513 544 486 616 414C521 390 423 423 358 484C356 496 357 505 362 512Z"
            fill={`url(#${glassWarm})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-mid-left"
            d="M357 485C292 444 232 348 242 244C328 294 365 380 362 461C362 471 360 479 357 485Z"
            fill={`url(#${glass})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-mid-right"
            d="M363 485C428 444 488 348 478 244C392 294 355 380 358 461C358 471 360 479 363 485Z"
            fill={`url(#${glass})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-inner-left"
            d="M359 461C315 401 302 294 337 195C386 271 386 374 362 449L359 461Z"
            fill={`url(#${glassDeep})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-inner-right"
            d="M361 461C405 401 418 294 383 195C334 271 334 374 358 449L361 461Z"
            fill={`url(#${glassDeep})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-crown"
            d="M360 410C303 348 309 213 360 92C411 213 417 348 360 410Z"
            fill={`url(#${glassWarm})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-cup-left"
            d="M360 504C305 488 261 444 242 375C313 383 353 427 360 504Z"
            fill={`url(#${glassWarm})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-petal hero-petal-cup-right"
            d="M360 504C415 488 459 444 478 375C407 383 367 427 360 504Z"
            fill={`url(#${glassWarm})`}
            stroke={`url(#${edge})`}
          />
          <path
            className="hero-lotus-core"
            d="M360 519C330 491 328 445 360 405C392 445 390 491 360 519Z"
            fill={`url(#${core})`}
          />
        </g>

        <g className="hero-lotus-glints" fill="none" stroke="var(--lotus-glass-highlight, #fff)" strokeLinecap="round">
          <path d="M131 412C216 398 295 431 342 480" />
          <path d="M589 412C504 398 425 431 378 480" />
          <path d="M192 292C269 323 322 383 351 450" />
          <path d="M528 292C451 323 398 383 369 450" />
          <path d="M360 124C342 203 342 307 360 385" />
        </g>
      </svg>
      <span className="hero-lotus-flare" />
    </div>
  );
}
