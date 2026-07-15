"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Menu,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ThemePreferences, ThemeToggle } from "@/components/theme-toggle";
import { LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const navLinks = [
  ["Главная", "/"],
  ["AI-подбор", "/care"],
  ["Блог", "/blog"],
  ["О проекте", "/about"],
  ["Профиль", "/profile"],
];

const headerLinks = navLinks.filter(([, href]) => href !== "/profile");

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openedByPointerRef = useRef(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const trigger = triggerRef.current;
    body.style.position = "fixed";
    body.style.inset = `-${scrollY}px 0 0`;
    body.style.width = "100%";
    if (!openedByPointerRef.current) closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const panel = document.querySelector<HTMLElement>("#mobile-navigation-panel");
      const focusable = panel?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      body.style.position = "";
      body.style.inset = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
      if (!openedByPointerRef.current) trigger?.focus();
      openedByPointerRef.current = false;
    };
  }, [mobileOpen]);

  return (
    <header className="site-header">
      <div className="site-chrome">
        <Link href="/" className="brand-mark" aria-label="Красавица, на главную">
          <span>К</span>
          <Sparkles aria-hidden="true" />
        </Link>

        <nav className="desktop-nav" aria-label="Основная навигация">
          {headerLinks.map(([label, href]) => (
            <HeaderNavLink key={href} label={label} href={href} active={isActivePath(pathname, href)} />
          ))}
        </nav>

        <div className="header-actions">
          <Link
            href="/profile"
            aria-label="Открыть профиль"
            aria-current={isActivePath(pathname, "/profile") ? "page" : undefined}
            className={cn("header-icon-button", isActivePath(pathname, "/profile") && "is-active")}
          >
            <UserRound aria-hidden="true" />
          </Link>
          <ThemeToggle className="header-theme-toggle" />
          <LinkButton href="/care" className="header-cta">
            Начать подбор
            <ArrowRight aria-hidden="true" />
          </LinkButton>
          <button
            ref={triggerRef}
            type="button"
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-panel"
            onClick={() => { openedByPointerRef.current = false; setMobileOpen((current) => !current); }}
            onPointerEnter={(event) => {
              if (event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
              openedByPointerRef.current = true;
              setMobileOpen(true);
            }}
            className="header-icon-button menu-trigger"
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mounted
        ? createPortal(
            <div
              className={cn("mobile-menu-root", mobileOpen && "is-open")}
              aria-hidden={!mobileOpen}
            >
              <button
                type="button"
                className="mobile-menu-backdrop"
                aria-label="Закрыть меню"
                onClick={() => setMobileOpen(false)}
                tabIndex={mobileOpen ? 0 : -1}
              />
              <motion.aside
                id="mobile-navigation-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Меню сайта"
                initial={false}
                animate={mobileOpen
                  ? { clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1, scale: 1, filter: "blur(0px)" }
                  : { clipPath: reduceMotion ? "inset(0% 0% 0% 100% round 24px)" : "inset(0% 0% 0% 100% round 36px)", opacity: 0, scale: .985, filter: reduceMotion ? "blur(0px)" : "blur(12px)" }}
                transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="mobile-menu-panel"
              >
                <div className="mobile-menu-head">
                  <div>
                    <p className="eyebrow-inverse">Красавица</p>
                    <p className="mobile-menu-title">Выберите, куда идти</p>
                  </div>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    aria-label="Закрыть меню"
                    onClick={() => setMobileOpen(false)}
                    className="mobile-menu-close"
                  >
                    <X aria-hidden="true" />
                  </button>
                </div>

                <div className="mobile-menu-art" aria-hidden="true">
                  <Image src="/krasavitsa-cinematic-hero-v2.png" alt="" fill sizes="420px" />
                  <span>BEAUTY INTELLIGENCE · 2026</span>
                </div>

                <nav className="mobile-nav" aria-label="Мобильная навигация">
                  {navLinks.map(([label, href], index) => (
                    <Link
                      key={href}
                      href={href}
                      tabIndex={mobileOpen ? 0 : -1}
                      onClick={() => setMobileOpen(false)}
                      className={cn("mobile-nav-link", isActivePath(pathname, href) && "is-active")}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{label}</strong>
                      {href === "/profile" ? <UserRound aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                    </Link>
                  ))}
                </nav>

                <div className="mobile-menu-foot">
                  <p>Тема интерфейса</p>
                  <ThemePreferences />
                  <LinkButton href="/care" className="mobile-menu-cta" tabIndex={mobileOpen ? 0 : -1}>
                    Начать AI-подбор
                    <ArrowRight aria-hidden="true" />
                  </LinkButton>
                </div>
              </motion.aside>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function HeaderNavLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn("desktop-nav-link", active && "is-active")}>
      {label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer id="contacts" className="site-footer">
      <div className="footer-lead">
        <p className="eyebrow">Красавица</p>
        <h2>Красота без лишнего шума.</h2>
        <p>AI-подбор ухода, волос и ароматов с понятным объяснением каждого шага.</p>
        <div className="footer-socials" aria-label="Социальные сети">
          <SocialIcon href="https://t.me/krasavitsa_ai_bot" label="Telegram-бот"><Bot /></SocialIcon>
          <SocialIcon href="https://t.me/krasavitsa_ai" label="Telegram-канал"><Send /></SocialIcon>
          <SocialIcon href="https://www.instagram.com/krasavitsa_ai?utm_source=qr" label="Instagram"><InstagramIcon /></SocialIcon>
          <SocialIcon href="https://vk.ru/krasavitsa_ai" label="VK"><VkIcon /></SocialIcon>
        </div>
      </div>
      <FooterColumn title="Разделы" links={navLinks} />
      <FooterColumn
        title="Документы"
        links={[
          ["Конфиденциальность", "/privacy"],
          ["Cookies", "/cookies"],
          ["Обработка данных", "/personal-data"],
          ["Соглашение", "/terms"],
        ]}
      />
      <div className="footer-meta">
        <span>© 2026 Красавица</span>
        <span>Информационный сервис. Не заменяет консультацию специалиста.</span>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer" aria-label={label}>{children}</a>;
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div className="footer-column">
      <p>{title}</p>
      <div>
        {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
      </div>
    </div>
  );
}

export function BeautyPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="site-shell">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function BeautyPortalGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("portal-grid", className)}>{children}</section>;
}

export function PortalPanel({
  children,
  className,
  image,
  priority = false,
}: {
  children?: ReactNode;
  className?: string;
  image?: string;
  priority?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
      data-has-image={image ? "true" : "false"}
      className={cn("portal-panel", className)}
    >
      {image ? <Image src={image} alt="" fill priority={priority} sizes="(min-width: 1024px) 50vw, 100vw" className="portal-panel-image" /> : null}
      {image ? <div className="portal-panel-overlay" /> : null}
      <div className="portal-panel-content">{children}</div>
    </motion.div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  cta = "Начать подбор",
  ctaHref = "/care",
  image = "/krasavitsa-editorial-hero.png",
  tiles = [],
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta?: string;
  ctaHref?: string;
  image?: string;
  tiles?: string[];
}) {
  return (
    <section className="page-hero section-shell">
      <div className="page-hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <LinkButton href={ctaHref}>{cta}<ArrowRight /></LinkButton>
      </div>
      <div className="page-hero-visual">
        <Image src={image} alt="" fill priority sizes="(min-width: 900px) 48vw, 100vw" />
        {tiles.length ? <div className="page-hero-tags">{tiles.slice(0, 3).map((tile) => <span key={tile}>{tile}</span>)}</div> : null}
      </div>
    </section>
  );
}

export function SectionIntro({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return <div className="section-intro section-shell"><p className="eyebrow">{kicker}</p><h2>{title}</h2><p>{text}</p></div>;
}

export function SoftCards({ items }: { items: Array<{ title: string; text: string }> }) {
  return <div className="soft-list section-shell">{items.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>;
}

export function TelegramCTA({
  title = "Продолжить в Telegram",
  text = "Красавица задаст пару уточняющих вопросов и сохранит рекомендации в чате.",
  href = "https://t.me/krasavitsa_ai_bot",
  secondaryHref,
  secondaryLabel,
}: {
  title?: string;
  text?: string;
  href?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="telegram-cta section-shell">
      <div><p className="eyebrow-inverse">Диалог без лишних экранов</p><h2>{title}</h2><p>{text}</p></div>
      <div className="telegram-cta-actions">
        <LinkButton href={href} className="button-light"><MessageCircle />{href.includes("_bot") ? "Открыть бота" : "Открыть канал"}</LinkButton>
        {secondaryHref && secondaryLabel ? <LinkButton href={secondaryHref} tone="ghost"><InstagramIcon />{secondaryLabel}</LinkButton> : null}
      </div>
    </section>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" /></svg>;
}

export function VkIcon({ className }: { className?: string }) {
  return <svg viewBox="3 7 13 9" fill="none" aria-hidden="true" className={className}><path d="M4 7.6c.16 4.88 2.45 7.81 6.38 7.81h.22v-2.8c1.58.16 2.77 1.3 3.25 2.8H16c-.6-2.2-2.15-3.42-3.12-3.9.97-.57 2.33-1.95 2.65-3.91h-1.87c-.42 1.6-1.68 2.98-3.06 3.11V7.6H8.73v3.7C7.33 10.95 5.57 9.45 5.49 7.6H4Z" fill="currentColor" /></svg>;
}
