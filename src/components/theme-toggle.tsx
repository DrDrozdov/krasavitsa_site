"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("krasavitsa-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nextTheme = getPreferredTheme();
      setTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("krasavitsa-theme", nextTheme);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить темную тему"}
      onClick={toggleTheme}
      className={cn(
        "apple-glass-button theme-toggle relative h-11 w-[76px] rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,.45)] p-1 text-[var(--color-text)] shadow-[inset_0_1px_0_rgba(255,255,255,.72),0_12px_30px_rgba(29,29,31,.08)] backdrop-blur-2xl transition duration-300 hover:bg-black hover:text-white",
        theme === "dark" && "is-dark bg-[rgba(30,26,24,.82)] text-white",
        className,
      )}
    >
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-current opacity-80">
        <Sun className="size-4" />
      </span>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-current opacity-80">
        <Moon className="size-4" />
      </span>
      <span className="theme-toggle-thumb absolute left-1 top-1 grid size-9 place-items-center rounded-full bg-white text-black shadow-[0_8px_22px_rgba(0,0,0,.18)] transition duration-300">
        {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </span>
    </button>
  );
}
