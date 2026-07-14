"use client";

export type Theme = "light" | "dark";
export type ThemeSource = "system" | "manual";

const themeKey = "krasavitsa-theme";
const sourceKey = "krasavitsa-theme-source";
const changeEvent = "krasavitsa-theme-change";

export function getThemePreference(): { theme: Theme; source: ThemeSource } {
  const stored = window.localStorage.getItem(themeKey);
  const source = window.localStorage.getItem(sourceKey);
  if (source === "manual" && (stored === "light" || stored === "dark")) return { theme: stored, source: "manual" };
  return { theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light", source: "system" };
}

export function applyTheme(theme: Theme, source: ThemeSource) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themeSource = source;
  document.querySelector("#krasavitsa-theme-color")?.setAttribute("content", theme === "dark" ? "#1d1417" : "#fcfafb");
}

export function setManualTheme(theme: Theme) {
  window.localStorage.setItem(themeKey, theme);
  window.localStorage.setItem(sourceKey, "manual");
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
  window.addEventListener("pageshow", onSystemChange);
  return () => {
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("pageshow", onSystemChange);
  };
}
