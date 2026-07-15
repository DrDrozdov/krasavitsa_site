"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export function DigitalLotus({ className, compact = false }: { className?: string; compact?: boolean }) {
  const id = useId().replace(/:/g, "");
  const petalGradient = `${id}-petal`;
  const edgeGradient = `${id}-edge`;
  const coreGradient = `${id}-core`;

  return (
    <div className={cn("digital-lotus", compact && "is-compact", className)} aria-hidden="true">
      <span className="digital-lotus-aura" />
      <span className="digital-lotus-orbit orbit-one" />
      <span className="digital-lotus-orbit orbit-two" />

      <svg className="digital-lotus-svg" viewBox="0 0 640 640" role="presentation">
        <defs>
          <linearGradient id={petalGradient} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className="lotus-stop-pearl" />
            <stop offset="0.18" className="lotus-stop-pink" />
            <stop offset="0.34" className="lotus-stop-violet" />
            <stop offset="0.51" className="lotus-stop-ice" />
            <stop offset="0.68" className="lotus-stop-rose" />
            <stop offset="0.84" className="lotus-stop-pearl" />
            <stop offset="1" className="lotus-stop-wine" />
          </linearGradient>
          <linearGradient id={edgeGradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="lotus-stop-edge-top" />
            <stop offset="1" className="lotus-stop-edge-bottom" />
          </linearGradient>
          <radialGradient id={coreGradient} cx="42%" cy="32%" r="70%">
            <stop offset="0" className="lotus-stop-core-light" />
            <stop offset="1" className="lotus-stop-core-dark" />
          </radialGradient>
          <filter id={`${id}-soft-glow`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        <g className="lotus-crosshair">
          <path d="M320 52V588" />
          <path d="M52 320H588" />
          <circle cx="320" cy="320" r="232" />
          <circle cx="320" cy="320" r="156" />
        </g>

        <circle className="lotus-core-glow" cx="320" cy="368" r="108" filter={`url(#${id}-soft-glow)`} />

        <g className="lotus-symbol">
          <path
            className="lotus-vector-petal lotus-outer-left"
            d="M319 496C238 492 150 454 94 376C178 354 258 389 320 466C320 477 320 487 319 496Z"
            fill={`url(#${petalGradient})`}
            stroke={`url(#${edgeGradient})`}
          />
          <path
            className="lotus-vector-petal lotus-outer-right"
            d="M321 496C402 492 490 454 546 376C462 354 382 389 320 466C320 477 320 487 321 496Z"
            fill={`url(#${petalGradient})`}
            stroke={`url(#${edgeGradient})`}
          />
          <path
            className="lotus-vector-petal lotus-mid-left"
            d="M319 474C252 435 187 351 180 251C269 286 315 363 319 456V474Z"
            fill={`url(#${petalGradient})`}
            stroke={`url(#${edgeGradient})`}
          />
          <path
            className="lotus-vector-petal lotus-mid-right"
            d="M321 474C388 435 453 351 460 251C371 286 325 363 321 456V474Z"
            fill={`url(#${petalGradient})`}
            stroke={`url(#${edgeGradient})`}
          />
          <path
            className="lotus-vector-petal lotus-inner-left"
            d="M320 447C270 390 247 291 282 190C338 253 349 355 320 447Z"
            fill={`url(#${petalGradient})`}
            stroke={`url(#${edgeGradient})`}
          />
          <path
            className="lotus-vector-petal lotus-inner-right"
            d="M320 447C370 390 393 291 358 190C302 253 291 355 320 447Z"
            fill={`url(#${petalGradient})`}
            stroke={`url(#${edgeGradient})`}
          />
          <path
            className="lotus-vector-petal lotus-crown"
            d="M320 374C261 317 264 202 320 105C376 202 379 317 320 374Z"
            fill={`url(#${petalGradient})`}
            stroke={`url(#${edgeGradient})`}
          />
          <path
            className="lotus-vector-petal lotus-cup-left"
            d="M320 482C269 466 224 423 205 365C273 367 311 410 320 482Z"
            fill={`url(#${petalGradient})`}
            stroke={`url(#${edgeGradient})`}
          />
          <path
            className="lotus-vector-petal lotus-cup-right"
            d="M320 482C371 466 416 423 435 365C367 367 329 410 320 482Z"
            fill={`url(#${petalGradient})`}
            stroke={`url(#${edgeGradient})`}
          />
          <path
            className="lotus-vector-core"
            d="M320 488C291 464 287 426 320 392C353 426 349 464 320 488Z"
            fill={`url(#${coreGradient})`}
          />
        </g>
      </svg>

      <span className="digital-lotus-refraction" />
      <span className="digital-lotus-index">K / MOTION 01</span>
      <span className="digital-lotus-status">BEAUTY INTELLIGENCE · LIVE</span>
    </div>
  );
}
