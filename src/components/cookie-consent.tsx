"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Consent = "all" | "essential" | "pending";

const cookieName = "krasavitsa_cookie_consent";

function readConsent(): Consent {
  const value = document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`))?.[1];
  return value === "all" || value === "essential" ? value : "pending";
}

function saveConsent(value: Exclude<Consent, "pending">) {
  document.cookie = `${cookieName}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("krasavitsa-cookie-consent", { detail: value }));
}

export function analyticsAllowed() {
  return typeof document !== "undefined" && readConsent() === "all";
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>("pending");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setConsent(readConsent()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (consent !== "pending") return null;

  const choose = (value: Exclude<Consent, "pending">) => {
    saveConsent(value);
    setConsent(value);
  };

  return (
    <aside className="cookie-consent liquid-glass fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-xl rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 text-[var(--color-text)] shadow-[var(--shadow-hover)] backdrop-blur-3xl md:bottom-6 md:left-auto md:right-6">
      <p className="text-sm font-black">Настройки cookies</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">Мы используем обязательные cookies для работы сайта. С согласия пользователя включаем обезличенную аналитику посещений.</p>
      <p className="mt-2 text-xs font-semibold text-[var(--color-text-soft)]"><Link href="/cookies" className="underline underline-offset-4">Политика cookies</Link> · <Link href="/privacy" className="underline underline-offset-4">Политика конфиденциальности</Link></p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("all")} className="apple-glass-button brand-action rounded-full px-4 py-2.5 text-sm font-black">Принять все</button>
        <button type="button" onClick={() => choose("essential")} className="apple-glass-button rounded-full border border-[var(--color-border)] bg-[var(--color-glass)] px-4 py-2.5 text-sm font-black text-[var(--color-text)]">Только необходимые</button>
      </div>
    </aside>
  );
}
