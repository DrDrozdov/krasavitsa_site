"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, MessageCircle, UserRound, X } from "lucide-react";
import { motion } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const navLinks = [
  ["Главная", "/"],
  ["AI-подбор", "/care"],
  ["Блог", "/blog"],
  ["О проекте", "/about"],
  ["Профиль", "/profile"],
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="liquid-glass sticky top-0 z-40 border-b border-[var(--color-border)] bg-[rgba(250,247,243,.62)] px-4 py-3 backdrop-blur-2xl md:px-6">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/krasavitsa-logo.png" alt="Красавица" width={46} height={46} className="rounded-full" priority />
          <span className="flex flex-col">
            <span className="text-xl font-black uppercase leading-none tracking-tight">Красавица</span>
            <span className="mt-1 text-[10px] font-normal uppercase leading-none text-[var(--color-text-soft)]">Beauty OS</span>
          </span>
        </Link>
        <nav className="hidden items-center justify-end gap-2 md:flex">
          {navLinks.map(([label, href]) => (
            <HeaderNavLink key={href} label={label} href={href} active={isActivePath(pathname, href)} />
          ))}
          <LinkButton href="/care" className="h-11 px-5">
            Попробовать AI
          </LinkButton>
          <ThemeToggle />
        </nav>
        <button
          type="button"
          aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((current) => !current)}
          className="apple-glass-button grid size-12 place-items-center rounded-full bg-black text-white shadow-[var(--shadow-card)] md:hidden"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      <div
        className={cn(
          "fixed inset-0 top-[73px] z-50 bg-black/28 opacity-0 backdrop-blur-sm transition duration-300 md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none",
        )}
        onClick={() => setMobileOpen(false)}
      >
        <motion.aside
          initial={false}
          animate={mobileOpen ? { x: 0, opacity: 1, filter: "blur(0px)" } : { x: 34, opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          onClick={(event) => event.stopPropagation()}
          className="ml-auto h-[calc(100svh-73px)] w-[min(86vw,380px)] overflow-y-auto border-l border-white/12 bg-[rgba(31,28,26,.88)] p-5 text-white shadow-[-24px_0_80px_rgba(0,0,0,.28)] backdrop-blur-3xl"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-white/42">Меню</p>
              <p className="mt-1 text-2xl font-black uppercase">Красавица</p>
            </div>
            <button
              type="button"
              aria-label="Закрыть меню"
              onClick={() => setMobileOpen(false)}
              className="apple-glass-button grid size-12 shrink-0 place-items-center rounded-full bg-white text-black"
            >
              <X className="size-6" />
            </button>
          </div>
          <nav className="grid gap-3">
            {navLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "apple-glass-button rounded-full border border-white/16 bg-white/10 px-6 py-4 text-lg font-black text-white backdrop-blur-2xl transition duration-300 hover:bg-white hover:text-black",
                  isActivePath(pathname, href) && "bg-white text-black",
                )}
              >
                {href === "/profile" ? <><UserRound className="mr-2 inline size-5" /><span className="sr-only">{label}</span></> : label}
              </Link>
            ))}
            <LinkButton href="/care" className="mt-2 h-14 w-full bg-white px-6 text-black hover:bg-white/90">
              Попробовать AI
            </LinkButton>
            <Link href="/#contacts" className="apple-glass-button rounded-full border border-white/16 bg-white/10 px-6 py-4 text-lg font-black text-white backdrop-blur-2xl transition duration-300 hover:bg-white hover:text-black">
              Контакты
            </Link>
            <ThemeToggle className="mt-1 border-white/18 bg-white/10 text-white hover:bg-white hover:text-black" />
          </nav>
        </motion.aside>
      </div>
    </header>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function HeaderNavLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "apple-glass-button group rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,.48)] px-5 py-3 text-sm font-bold text-[var(--color-text)] shadow-[inset_0_1px_0_rgba(255,255,255,.72)] backdrop-blur-2xl transition duration-300 hover:border-black/20 hover:bg-black hover:text-white",
        active && "brand-action border-transparent text-white shadow-[0_18px_48px_rgba(92,31,45,.18)]",
      )}
    >
      <span>{label}</span>
      {active ? <span className="ml-2 inline-block size-1.5 rounded-full bg-[#74d58a] shadow-[0_0_14px_rgba(116,213,138,.9)]" /> : null}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer id="contacts" className="px-3 pb-5 pt-2 md:px-5">
      <div className="liquid-glass mx-auto max-w-none rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-glass-strong)] p-6 text-sm font-semibold text-[var(--color-text-muted)] shadow-[var(--shadow-soft)] backdrop-blur-2xl md:p-8">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image src="/krasavitsa-logo.png" alt="Красавица" width={42} height={42} className="rounded-full" />
              <div>
                <p className="text-lg font-black uppercase text-[var(--color-text)]">Красавица</p>
                <p className="mt-1 text-xs font-normal uppercase text-[var(--color-text-soft)]">Beauty OS</p>
              </div>
            </div>
            <p className="mt-5 max-w-xl leading-6">
              Единый AI-подбор ухода за кожей, волосами и ароматов. Рекомендации носят информационный характер и не заменяют консультацию специалиста.
            </p>
            <p className="mt-4 text-xs text-[var(--color-text-soft)]">© 2026 Красавица</p>
          </div>
          <FooterColumn title="Разделы" links={navLinks} />
          <FooterColumn
            title="Документы"
            links={[
              ["Политика конфиденциальности", "/privacy"],
              ["Политика cookies", "/cookies"],
              ["Согласие на обработку данных", "/personal-data"],
              ["Пользовательское соглашение", "/terms"],
              ["Telegram-канал", "https://t.me/krasavitsa_ai"],
              ["Instagram", "https://www.instagram.com/"],
              ["Разработчик: @thesp3cial", "https://t.me/thesp3cial"],
            ]}
          />
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">{title}</p>
      <div className="mt-4 grid gap-3">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="hover:text-[var(--color-text)]">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BeautyPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function BeautyPortalGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("liquid-glass mx-auto grid w-full max-w-none gap-2 overflow-hidden rounded-[var(--radius-xxl)] border border-[var(--color-border)] bg-[rgba(255,253,251,.68)] p-2 shadow-[var(--shadow-soft)] md:grid-cols-12", className)}>
      {children}
    </section>
  );
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
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.006 }}
      whileTap={{ scale: 0.986 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      data-has-image={image ? "true" : "false"}
      className={cn("liquid-glass apple-glass-card meaning-card portal-panel relative min-h-[220px] overflow-hidden rounded-[var(--radius-lg)] border border-white/55 bg-[var(--color-glass)] p-5 backdrop-blur-2xl md:p-6", className)}
    >
      {image ? (
        <Image src={image} alt="" fill priority={priority} sizes="(min-width: 1024px) 50vw, 100vw" className="portal-panel-image object-cover object-center" />
      ) : null}
      <div className={cn("portal-panel-overlay absolute inset-0", image ? "bg-[linear-gradient(115deg,rgba(250,247,243,.88),rgba(250,247,243,.42)_48%,rgba(250,247,243,.2))]" : "bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,.9),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.72),rgba(247,228,218,.34))]")} />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  cta = "Начать подбор",
  ctaHref = "/care",
  image = "/beauty-products-portal.png",
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
    <div className="px-3 pb-2 pt-5 md:px-5">
      <BeautyPortalGrid className="min-h-[520px]">
        <PortalPanel className="md:col-span-7 md:row-span-2" image={image} priority>
          <div className="flex min-h-[430px] flex-col justify-between">
            <div>
              <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">{eyebrow}</p>
              <h1 className="mt-5 max-w-4xl text-[clamp(2.7rem,5.7vw,5.8rem)] font-black leading-[0.94] tracking-tight">{title}</h1>
            </div>
            <p className="max-w-2xl text-base font-semibold leading-7 text-[var(--color-text-muted)]">{subtitle}</p>
          </div>
        </PortalPanel>
        <PortalPanel className="md:col-span-5">
          <div className="flex h-full flex-col justify-between gap-8">
            <p className="max-w-md text-xl font-black leading-tight">Без хаоса, случайных советов и лишних покупок.</p>
            <LinkButton href={ctaHref} className="h-12 w-fit px-6">
              {cta}
              <ArrowRight className="size-4 -rotate-45" />
            </LinkButton>
          </div>
        </PortalPanel>
        <PortalPanel className="md:col-span-5">
          <div className="grid h-full gap-3 sm:grid-cols-2">
            {tiles.map((tile, index) => (
              <div key={tile} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white/54 p-4 text-sm font-black text-[var(--color-text-muted)] backdrop-blur-xl">
                <span className="text-[var(--color-text-soft)]">0{index + 1}</span>
                <p className="mt-2 text-[var(--color-text)]">{tile}</p>
              </div>
            ))}
          </div>
        </PortalPanel>
      </BeautyPortalGrid>
    </div>
  );
}

export function SectionIntro({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-none px-3 py-8 md:px-5 md:py-10">
      <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">{kicker}</p>
      <h2 className="mt-4 max-w-4xl text-[clamp(2.1rem,3.8vw,3.9rem)] font-black leading-[0.98] tracking-tight">{title}</h2>
      <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-[var(--color-text-muted)]">{text}</p>
    </div>
  );
}

export function SoftCards({ items }: { items: Array<{ title: string; text: string }> }) {
  return (
    <div className="mx-auto grid max-w-none gap-2 px-3 pb-2 md:grid-cols-3 md:px-5">
      {items.map((item) => (
        <motion.article
          key={item.title}
          whileHover={{ y: -5, scale: 1.008 }}
          whileTap={{ scale: 0.986 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="liquid-glass apple-glass-card rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-glass)] p-5 shadow-[var(--shadow-card)] backdrop-blur-2xl"
        >
          <h3 className="text-2xl font-black leading-tight">{item.title}</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{item.text}</p>
        </motion.article>
      ))}
    </div>
  );
}

export function TelegramCTA({
  title = "Продолжить в Telegram",
  text = "Красавица задаст пару уточняющих вопросов и сохранит рекомендации в чате.",
  href = "https://t.me/krasavitsa_ai_bot",
}: {
  title?: string;
  text?: string;
  href?: string;
}) {
  return (
    <div className="px-3 py-2 md:px-5">
      <div className="liquid-glass apple-glass-card mx-auto flex max-w-none flex-col justify-between gap-6 rounded-[var(--radius-xl)] border border-black/10 bg-white/42 p-5 text-[var(--color-text)] shadow-[var(--shadow-soft)] backdrop-blur-2xl md:flex-row md:items-center md:p-6">
        <div>
          <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Telegram</p>
          <h2 className="mt-3 text-[clamp(2.1rem,3.4vw,3.6rem)] font-black leading-none">{title}</h2>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{text}</p>
        </div>
        <LinkButton href={href} className="h-14 w-fit bg-black px-7 text-white hover:bg-neutral-800">
          <MessageCircle className="size-5" />
          Открыть бот
        </LinkButton>
      </div>
    </div>
  );
}
