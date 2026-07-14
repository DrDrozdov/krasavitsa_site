"use client";

export type Theme = "light" | "dark";
export type ThemePreference = "system" | Theme;

const preferenceKey = "krasavitsa-theme-preference";
const schemaKey = "krasavitsa-theme-schema";
const schemaVersion = "3";
const legacyThemeKey = "krasavitsa-theme";
const legacySourceKey = "krasavitsa-theme-source";
const changeEvent = "krasavitsa-theme-change";

let memoryPreference: ThemePreference = "system";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function migrateOnce() {
  try {
    if (window.localStorage.getItem(schemaKey) === schemaVersion) return;
    // Previous releases could save a dark override without exposing its source.
    // Reset that ambiguous state once, then persist all new choices explicitly.
    window.localStorage.removeItem(legacyThemeKey);
    window.localStorage.removeItem(legacySourceKey);
    window.localStorage.removeItem(preferenceKey);
    window.localStorage.setItem(schemaKey, schemaVersion);
  } catch {
    // Storage can be unavailable in Safari private/restricted contexts.
    // Keep the in-memory preference intact for the current session.
  }
}

export function getThemeState(): { theme: Theme; preference: ThemePreference } {
  migrateOnce();
  let preference = memoryPreference;

  try {
    const stored = window.localStorage.getItem(preferenceKey);
    preference = stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    // Safari private/restricted contexts can deny storage. Session memory still works.
  }

  memoryPreference = preference;
  return {
    preference,
    theme: preference === "system" ? systemTheme() : preference,
  };
}

export function applyTheme(theme: Theme, preference: ThemePreference) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  root.dataset.themeSource = preference === "system" ? "system" : "manual";
  root.style.colorScheme = theme;
  document
    .querySelector<HTMLMetaElement>("#krasavitsa-theme-color")
    ?.setAttribute("content", theme === "dark" ? "#160b11" : "#fff8f6");
}

export function setThemePreference(preference: ThemePreference) {
  memoryPreference = preference;
  try {
    if (preference === "system") window.localStorage.removeItem(preferenceKey);
    else window.localStorage.setItem(preferenceKey, preference);
    window.localStorage.setItem(schemaKey, schemaVersion);
  } catch {
    // Keep the selected preference in memory for this browser session.
  }

  const state = getThemeState();
  applyTheme(state.theme, state.preference);
  window.dispatchEvent(new CustomEvent(changeEvent));
}

export function subscribeTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  let frame = 0;

  const sync = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      const state = getThemeState();
      applyTheme(state.theme, state.preference);
      callback();
    });
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible") sync();
  };

  if (typeof media.addEventListener === "function") media.addEventListener("change", sync);
  else media.addListener(sync);
  window.addEventListener(changeEvent, sync);
  window.addEventListener("storage", sync);
  window.addEventListener("pageshow", sync);
  window.addEventListener("focus", sync);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    window.cancelAnimationFrame(frame);
    if (typeof media.removeEventListener === "function") media.removeEventListener("change", sync);
    else media.removeListener(sync);
    window.removeEventListener(changeEvent, sync);
    window.removeEventListener("storage", sync);
    window.removeEventListener("pageshow", sync);
    window.removeEventListener("focus", sync);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
