"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

type Consent = "all" | "essential" | "pending";

const cookieName = "krasavitsa_cookie_consent_v2";
const legacyCookieName = "krasavitsa_cookie_consent";

function readConsent(): Consent {
  const value = document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`))?.[1];
  return value === "all" || value === "essential" ? value : "pending";
}

function saveConsent(value: Exclude<Consent, "pending">) {
  document.cookie = `${cookieName}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
  document.cookie = `${legacyCookieName}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("krasavitsa-cookie-consent", { detail: value }));
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>("pending");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setConsent(readConsent()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const choose = (value: Exclude<Consent, "pending">) => {
    saveConsent(value);
    setConsent(value);
  };

  return (
    <AnimatePresence>
      {consent === "pending" ? (
        <motion.aside
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.97, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98, filter: "blur(8px)" }}
          transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="cookie-consent liquid-glass z-[80] mx-auto max-w-xl rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 text-[var(--color-text)] shadow-[var(--shadow-hover)] backdrop-blur-3xl"
        >
          <p className="text-sm font-black">Ваши настройки сайта</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">Обезличенная продуктовая статистика работает без cookies и не хранит текст запросов или постоянный ID. Cookies нужны только для дополнительных настроек и безопасной сессии профиля.</p>
          <p className="mt-2 text-xs font-semibold text-[var(--color-text-soft)]"><Link href="/cookies" className="underline underline-offset-4">Политика cookies</Link> · <Link href="/privacy" className="underline underline-offset-4">Политика конфиденциальности</Link></p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => choose("all")} className="apple-glass-button brand-action rounded-full px-4 py-2.5 text-sm font-black">Разрешить настройки</button>
            <button type="button" onClick={() => choose("essential")} className="apple-glass-button rounded-full border border-[var(--color-border)] bg-[var(--color-glass)] px-4 py-2.5 text-sm font-black text-[var(--color-text)]">Без дополнительных cookies</button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
