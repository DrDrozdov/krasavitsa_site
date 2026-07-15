"use client";

import { Check, Gauge, Laptop, Moon, Sparkles, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  applyTheme,
  getThemeState,
  setThemePreference,
  subscribeTheme,
  type Theme,
  type ThemePreference,
} from "@/lib/theme-client";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(() => "light");
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const sync = () => {
      const state = getThemeState();
      applyTheme(state.theme, state.preference);
      setTheme(state.theme);
      setPreference(state.preference);
    };
    sync();
    return subscribeTheme(sync);
  }, []);

  const toggleTheme = () => setThemePreference(theme === "dark" ? "light" : "dark");

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
      title={preference === "system" ? "Тема устройства" : "Тема выбрана вручную"}
      onClick={toggleTheme}
      className={cn("theme-switch apple-glass-button", theme === "dark" && "is-dark", className)}
    >
      <span className="theme-switch-thumb" aria-hidden="true">
        <Sun className="theme-switch-sun" />
        <Moon className="theme-switch-moon" />
      </span>
      <span className="sr-only">{preference === "system" ? "Авто" : "Вручную"}</span>
    </button>
  );
}

const choices: Array<{ value: ThemePreference; label: string; Icon: typeof Sun }> = [
  { value: "system", label: "Авто", Icon: Laptop },
  { value: "light", label: "Светлая", Icon: Sun },
  { value: "dark", label: "Тёмная", Icon: Moon },
];

export function ThemePreferences({ className }: { className?: string }) {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const sync = () => setPreference(getThemeState().preference);
    sync();
    return subscribeTheme(sync);
  }, []);

  return (
    <div className={cn("theme-preferences", className)} role="group" aria-label="Настройка темы">
      {choices.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setThemePreference(value)}
          className={cn("theme-preference", preference === value && "is-active")}
          aria-pressed={preference === value}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
          {preference === value ? <Check className="theme-preference-check" aria-hidden="true" /> : null}
        </button>
      ))}
    </div>
  );
}

type MotionPreference = "full" | "reduced";
const motionPreferenceKey = "krasavitsa-motion-preference";

export function MotionPreferences({ className }: { className?: string }) {
  const [preference, setPreference] = useState<MotionPreference>("full");

  useEffect(() => {
    let stored: MotionPreference = "full";
    try {
      stored = window.localStorage.getItem(motionPreferenceKey) === "reduced" ? "reduced" : "full";
    } catch {}
    document.documentElement.dataset.motion = stored;
    const frame = window.requestAnimationFrame(() => setPreference(stored));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const select = (value: MotionPreference) => {
    setPreference(value);
    document.documentElement.dataset.motion = value;
    try {
      window.localStorage.setItem(motionPreferenceKey, value);
    } catch {}
  };

  return (
    <div className={cn("motion-preferences", className)} role="group" aria-label="Интенсивность анимации">
      <button type="button" className={cn(preference === "full" && "is-active")} aria-pressed={preference === "full"} onClick={() => select("full")}>
        <Sparkles aria-hidden="true" /><span>Полная</span>
      </button>
      <button type="button" className={cn(preference === "reduced" && "is-active")} aria-pressed={preference === "reduced"} onClick={() => select("reduced")}>
        <Gauge aria-hidden="true" /><span>Спокойная</span>
      </button>
    </div>
  );
}
