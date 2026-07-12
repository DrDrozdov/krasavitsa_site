"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("krasavitsa-theme");
  const source = window.localStorage.getItem("krasavitsa-theme-source");
  if (source === "manual" && (stored === "dark" || stored === "light")) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nextTheme = getPreferredTheme();
      setTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.dataset.themeSource = window.localStorage.getItem("krasavitsa-theme-source") === "manual" ? "manual" : "system";
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = (event: MediaQueryListEvent) => {
      if (window.localStorage.getItem("krasavitsa-theme-source") === "manual") return;
      const nextTheme: Theme = event.matches ? "dark" : "light";
      setTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.dataset.themeSource = "system";
    };
    media.addEventListener("change", syncSystemTheme);

    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", syncSystemTheme);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("krasavitsa-theme", nextTheme);
    window.localStorage.setItem("krasavitsa-theme-source", "manual");
    document.documentElement.dataset.themeSource = "manual";
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить темную тему"}
      onClick={toggleTheme}
      className={cn(
        "apple-glass-button theme-toggle relative flex h-11 w-[78px] shrink-0 items-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,.45)] p-[3px] text-[var(--color-text)] shadow-[inset_0_1px_0_rgba(255,255,255,.72),0_12px_30px_rgba(29,29,31,.08)] backdrop-blur-2xl transition duration-300 hover:bg-[var(--color-bordeaux)] hover:text-white",
        theme === "dark" && "is-dark bg-[rgba(30,26,24,.82)] text-white",
        className,
      )}
    >
      <span className="theme-toggle-thumb grid size-[38px] shrink-0 place-items-center rounded-full bg-white text-black shadow-[0_8px_22px_rgba(0,0,0,.18)] transition-transform duration-300 ease-[var(--ease-soft)]">
        {theme === "dark" ? <Moon className="size-4 text-[#5c1f2d]" strokeWidth={2.6} /> : <Sun className="size-4 text-[#2a171c]" strokeWidth={2.6} />}
      </span>
    </button>
  );
}
