"use client";

import { useEffect } from "react";

const interactiveSelector = [
  "button",
  "a[href]",
  "[role='button']",
  ".apple-glass-button",
  ".apple-glass-card",
  ".roadmap-item",
].join(",");

function findTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const element = target.closest(interactiveSelector);
  if (!(element instanceof HTMLElement)) {
    return null;
  }

  if (element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true") {
    return null;
  }

  return element;
}

function updatePointer(element: HTMLElement, event: PointerEvent) {
  const rect = element.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  element.dataset.pointerGlow = "true";
  element.style.setProperty("--pointer-x", `${Math.min(100, Math.max(0, x)).toFixed(2)}%`);
  element.style.setProperty("--pointer-y", `${Math.min(100, Math.max(0, y)).toFixed(2)}%`);
}

export function PointerGlow() {
  useEffect(() => {
    let active: HTMLElement | null = null;

    const onPointerMove = (event: PointerEvent) => {
      const element = findTarget(event.target);
      if (!element) {
        return;
      }

      if (active && active !== element) {
        active.dataset.pointerActive = "false";
      }

      active = element;
      element.dataset.pointerGlow = "true";
      element.dataset.pointerActive = "true";
      updatePointer(element, event);
    };

    const onPointerDown = (event: PointerEvent) => {
      const element = findTarget(event.target);
      if (!element) {
        return;
      }
      updatePointer(element, event);
      element.dataset.pointerPressed = "true";
    };

    const clearPress = (event: PointerEvent) => {
      const element = findTarget(event.target) ?? active;
      if (element) {
        element.dataset.pointerPressed = "false";
      }
    };

    const onPointerOut = (event: PointerEvent) => {
      const element = findTarget(event.target);
      if (!element) {
        return;
      }

      const related = event.relatedTarget;
      if (related instanceof Node && element.contains(related)) {
        return;
      }

      element.dataset.pointerActive = "false";
      element.dataset.pointerPressed = "false";
      if (active === element) {
        active = null;
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", clearPress, { passive: true });
    window.addEventListener("pointercancel", clearPress, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", clearPress);
      window.removeEventListener("pointercancel", clearPress);
      window.removeEventListener("pointerout", onPointerOut);
    };
  }, []);

  return null;
}
