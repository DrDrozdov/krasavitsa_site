"use client";

export type Theme = "light" | "dark";
export type ThemeSource = "system" | "manual";

const themeKey = "krasavitsa-theme";
const sourceKey = "krasavitsa-theme-source";
const changeEvent = "krasavitsa-theme-change";
let memoryOverride: Theme | null = null;

export function getThemePreference(): { theme: Theme; source: ThemeSource } {
  try {
    const stored = window.localStorage.getItem(themeKey);
    const source = window.localStorage.getItem(sourceKey);
    if (source === "manual" && (stored === "light" || stored === "dark")) return { theme: stored, source: "manual" };
    memoryOverride = null;
  } catch {
    if (memoryOverride) return { theme: memoryOverride, source: "manual" };
  }
  return { theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light", source: "system" };
}

export function applyTheme(theme: Theme, source: ThemeSource) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themeSource = source;
  root.style.colorScheme = theme;
  document.querySelector("#krasavitsa-theme-color")?.setAttribute("content", theme === "dark" ? "#1d1417" : "#fcfafb");
}

export function setManualTheme(theme: Theme) {
  memoryOverride = theme;
  try {
    window.localStorage.setItem(themeKey, theme);
    window.localStorage.setItem(sourceKey, "manual");
  } catch {
    // Safari can deny localStorage in restricted contexts. The in-memory
    // override still keeps the controls and page synchronized for the session.
  }
  applyTheme(theme, "manual");
  window.dispatchEvent(new CustomEvent(changeEvent));
}

export function subscribeTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    const preference = getThemePreference();
    if (preference.source === "system") applyTheme(preference.theme, preference.source);
    callback();
  };
  media.addEventListener("change", onSystemChange);
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", onSystemChange);
  window.addEventListener("pageshow", onSystemChange);
  return () => {
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", onSystemChange);
    window.removeEventListener("pageshow", onSystemChange);
  };
}
