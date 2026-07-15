"use client";

import { useEffect } from "react";

const interactiveSelector = [
  ".apple-glass-button",
  "[data-pointer-glow='true']",
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
  if (event.pointerType === "mouse" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const dx = Math.max(-7, Math.min(7, (x - 50) * 0.13));
    const dy = Math.max(-6, Math.min(6, (y - 50) * 0.11));
    element.style.setProperty("--pointer-dx", `${dx.toFixed(2)}px`);
    element.style.setProperty("--pointer-dy", `${dy.toFixed(2)}px`);
  }
}

export function PointerGlow() {
  useEffect(() => {
    let active: HTMLElement | null = null;
    let frame = 0;
    let pending: { element: HTMLElement; event: PointerEvent } | null = null;

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
      pending = { element, event };
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          if (pending) updatePointer(pending.element, pending.event);
          pending = null;
        });
      }
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
      element.style.setProperty("--pointer-dx", "0px");
      element.style.setProperty("--pointer-dy", "0px");
      if (active === element) {
        active = null;
      }
    };

    const resetActive = () => {
      if (!active) return;
      active.dataset.pointerActive = "false";
      active.dataset.pointerPressed = "false";
      active.style.setProperty("--pointer-dx", "0px");
      active.style.setProperty("--pointer-dy", "0px");
      active = null;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", clearPress, { passive: true });
    window.addEventListener("pointercancel", clearPress, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("blur", resetActive);
    window.addEventListener("scroll", resetActive, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", clearPress);
      window.removeEventListener("pointercancel", clearPress);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", resetActive);
      window.removeEventListener("scroll", resetActive);
    };
  }, []);

  return null;
}
