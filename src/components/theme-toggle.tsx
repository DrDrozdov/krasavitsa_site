"use client";

import { Check, Laptop, Moon, Sun } from "lucide-react";
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
