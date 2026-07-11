"use client";

import Image from "next/image";
import {
  ArrowRight,
  Menu,
  MessageCircle,
  Send,
  WandSparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, LinkButton } from "@/components/ui/button";
import { BeautyPortalGrid, PortalPanel } from "@/components/portal-components";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    __krasavitsaAppReady?: () => void;
  }
}

const roadmap = [
  {
    label: "Сейчас",
    title: "Единый AI-подбор",
    text: "Кожа, волосы и ароматы собраны в одном сценарии с отдельными правилами и примерами для каждого направления.",
    action: "Попробовать подбор",
    metric: "Live",
  },
  {
    label: "Профиль",
    title: "Личный профиль",
    text: "Регистрация, защищённая сессия и аватар уже работают в российском серверном контуре.",
    action: "Создать профиль",
    metric: "Profile",
  },
  {
    label: "Дальше",
    title: "История и обратная связь",
    text: "Следующий слой продукта — сохранение подборок и реакции, которые улучшают персональный контекст.",
    action: "Следить за развитием",
    metric: "Next",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export function LandingPage() {
  const [selectedRoadmap, setSelectedRoadmap] = useState(0);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => {
      window.__krasavitsaAppReady?.();
    }, 260);

    return () => window.clearTimeout(readyTimer);
  }, []);

  function focusAi(prefill?: string) {
    const suffix = prefill ? `?q=${encodeURIComponent(prefill)}` : "";
    window.location.assign(`/care${suffix}`);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header onTry={() => focusAi()} />

      <section id="home" className="grid min-h-[86svh] gap-2 px-3 pb-2 pt-18 md:min-h-screen md:px-5 md:pt-20">
        <PortalTile className="relative min-h-[620px] overflow-hidden md:min-h-0" delay={0.25} hero>
          <div className="liquid-glass absolute left-5 top-5 z-10 max-w-[330px] rounded-3xl border border-white/55 bg-white/38 px-5 py-4 text-sm font-semibold leading-5 text-black/70 backdrop-blur-2xl md:left-8 md:top-8">
            Уход, который ощущается личным: Красавица бережно собирает рекомендации под кожу, бюджет и ваш ритм.
          </div>
          <div className="absolute bottom-40 left-4 z-10 md:bottom-24 md:left-8">
            <h1 className="max-w-5xl text-[clamp(3.55rem,10.4vw,9.8rem)] font-black leading-[0.9] tracking-tight">
              Красавица
            </h1>
            <p className="mt-6 text-xl font-normal uppercase leading-none text-black/22 md:mt-9 md:text-3xl">
              Beauty OS
            </p>
          </div>
          <div className="absolute bottom-5 left-4 right-4 z-10 flex flex-col gap-2 md:bottom-8 md:left-auto md:right-8 md:w-auto">
            <Button onClick={() => focusAi()} className="h-14 px-7">
              <WandSparkles className="size-5" />
              Попробовать AI
            </Button>
            <LinkButton href="https://t.me/krasavitsa_ai_bot" tone="secondary" className="h-14 px-7">
              <MessageCircle className="size-5" />
              Telegram
            </LinkButton>
          </div>
        </PortalTile>
      </section>

      <HomePortalIntro onStart={() => focusAi("Хочу подобрать уход: тип кожи, бюджет и задача")} />

      <section id="telegram" className="grid gap-2 px-3 pb-2 pt-2 md:grid-cols-[1fr_0.9fr] md:px-5">
        <TelegramPortalPanel />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="liquid-glass relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-powder-light)] p-2"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_8%,rgba(255,255,255,.62),transparent_32%),linear-gradient(145deg,rgba(232,199,192,.68),rgba(92,31,45,.16))]" />
          <div className="relative z-10 flex min-h-[480px] flex-col justify-between rounded-[var(--radius-lg)] border border-white/55 bg-white/32 p-5 text-[var(--color-text)] shadow-[inset_0_0_0_1px_rgba(255,255,255,.16)] backdrop-blur-2xl md:p-6">
            <div>
              <p className="text-xs font-black uppercase text-black/45">Продукт</p>
              <h3 className="mt-3 text-[clamp(2.5rem,4.7vw,4.4rem)] font-black leading-[0.9]">
                Как всё
                <br />
                устроено
              </h3>
            </div>

            <div className="my-5 grid gap-2">
              {roadmap.map((item, index) => (
                <motion.button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedRoadmap(index)}
                  whileHover={{ scale: [1, 1.012, 1.006] }}
                  whileTap={{ scale: [1, 1.012, 1.006] }}
                  transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "roadmap-item liquid-glass group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border p-3 text-left backdrop-blur-2xl transition-all duration-500",
                    "is-idle border-white/55",
                  )}
                >
                  <span className="grid size-9 place-items-center rounded-full bg-white/64 text-xs font-black text-black/70 transition-colors duration-500 group-hover:bg-white group-hover:text-black">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-black">{item.label}</span>
                    <span className="mt-1 block text-xs font-semibold text-black/48 transition-colors duration-500 group-hover:text-white/62">
                      {item.title}
                    </span>
                  </span>
                  <span className="text-xs font-black uppercase text-black/50 transition-colors duration-500 group-hover:text-white">
                    {item.metric}
                  </span>
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={roadmap[selectedRoadmap].label}
                initial={{ opacity: 0, y: 14, scale: 0.985, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, scale: 0.99, filter: "blur(8px)" }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="liquid-glass rounded-2xl border border-white/70 bg-white/64 p-4 text-black shadow-[var(--shadow-glass)] backdrop-blur-2xl"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase text-black/45">{roadmap[selectedRoadmap].label}</p>
                    <h4 className="mt-1 text-xl font-black">{roadmap[selectedRoadmap].title}</h4>
                  </div>
                  <span className="rounded-full bg-black px-3 py-2 text-xs font-black uppercase text-white">
                    {roadmap[selectedRoadmap].metric}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-6 text-black/60">{roadmap[selectedRoadmap].text}</p>
                <button
                  type="button"
                  onClick={() => {
                    focusAi(roadmap[selectedRoadmap].action);
                  }}
                  className="apple-glass-button mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-sm font-black text-white transition duration-300 hover:bg-black/85"
                >
                  {roadmap[selectedRoadmap].action}
                  <ArrowRight className="size-4 -rotate-45" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}

function HomePortalIntro({ onStart }: { onStart: () => void }) {
  const steps = [
    ["Опишите задачу", "Кожа, волосы, бюджет, привычки и нежелательные ингредиенты."],
    ["Укажите бюджет", "Красавица не предлагает лишнее и объясняет приоритеты."],
    ["Получите понятный уход", "Каждое средство находится в карточке с причиной выбора."],
    ["Сохраните рекомендации", "История и избранное будут собираться в профиле."],
  ];
  const floating = [
    ["Тип кожи", "комбинированная"],
    ["Бюджет", "до 2500 ₽"],
    ["Фокус", "барьер + SPF"],
    ["Формат", "утро / вечер"],
  ];

  return (
    <section className="px-3 pb-2 pt-2 md:px-5">
      <BeautyPortalGrid className="min-h-0 max-w-none">
        <PortalPanel className="md:col-span-12" image="/beauty-bg-02.svg">
          <div className="grid min-h-[540px] gap-2 md:grid-cols-12 md:grid-rows-[auto_auto]">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass flex min-h-[270px] flex-col justify-between rounded-[var(--radius-lg)] border border-white/60 bg-white/36 p-5 shadow-[var(--shadow-glass)] backdrop-blur-2xl md:col-span-7 md:p-6"
            >
              <div>
                <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Подбор ухода</p>
                <h2 className="mt-4 max-w-2xl text-[clamp(2.45rem,4.5vw,4.8rem)] font-black leading-[0.92] tracking-tight">
                  Подбор ухода без хаоса
                </h2>
              </div>
              <div>
                <p className="max-w-xl text-base font-semibold leading-7 text-[var(--color-text-muted)]">
                  Красавица помогает собрать уход по задаче, а не по случайным советам из ленты. Спокойно, понятно и с уважением к бюджету.
                </p>
                <Button onClick={onStart} className="mt-5 h-12 px-6">
                  Начать подбор
                  <ArrowRight className="size-4 -rotate-45" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 18, scale: 0.985 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.72, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass relative min-h-[240px] overflow-hidden rounded-[var(--radius-lg)] border border-white/60 bg-white/32 p-5 shadow-[var(--shadow-glass)] backdrop-blur-2xl md:col-span-5 md:p-6"
            >
              <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Live сценарий</p>
              <h3 className="mt-3 max-w-sm text-[clamp(1.55rem,2.3vw,2.15rem)] font-black leading-tight">Подбор собирается на глазах</h3>
              <div className="relative mt-6 min-h-[126px]">
                {floating.map(([label, value], index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 14, scale: 0.97, filter: "blur(10px)" }}
                    animate={{ opacity: [0, 1, 1, 0], y: [14, 0, 0, -6], scale: [0.97, 1, 1, 0.985], filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(8px)"] }}
                    transition={{ duration: 10.5, delay: index * 2.35, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
                    className="live-chip liquid-glass absolute left-0 right-0 rounded-[var(--radius-md)] border border-white/70 bg-white/58 p-3 shadow-[var(--shadow-card)] backdrop-blur-2xl"
                    style={{ top: `${index * 24}px` }}
                  >
                    <p className="text-[10px] font-black uppercase text-[var(--color-text-soft)]">{label}</p>
                    <p className="mt-1 text-base font-black">{value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-2 md:col-span-12 md:grid-cols-4">
              {steps.map(([title, text], index) => (
                <StepCard key={title} index={index + 1} title={title} text={text} />
              ))}
            </div>
          </div>
        </PortalPanel>
      </BeautyPortalGrid>
    </section>
  );
}

function StepCard({ index, title, text }: { index: number; title: string; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -6, scale: 1.018 }}
      whileTap={{ scale: 0.982 }}
      transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
      className="liquid-glass h-full rounded-[var(--radius-md)] border border-white/60 bg-white/42 p-4 shadow-[var(--shadow-card)] backdrop-blur-2xl"
    >
      <p className="text-xs font-black text-[var(--color-text-soft)]">0{index}</p>
      <h3 className="mt-2 text-xl font-black leading-tight">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{text}</p>
    </motion.div>
  );
}

function Header({ onTry }: { onTry: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    ["Главное", "#home"],
    ["AI-подбор", "/care"],
    ["Блог", "/blog"],
    ["Профиль", "/profile"],
  ];
  const mobileLinks = [...links, ["Контакты", "#contacts"]];

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[var(--color-border)] bg-[rgba(250,247,243,.62)] px-4 py-2 backdrop-blur-2xl md:px-6 md:py-3">
        <a href="#home" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image src="/krasavitsa-logo.png" alt="Красавица" width={48} height={48} className="rounded-full" priority />
          <span className="flex flex-col">
            <span className="text-xl font-black uppercase leading-none tracking-tight md:text-2xl">Красавица</span>
            <span className="mt-1 text-[9px] font-bold uppercase leading-none text-[var(--color-text-soft)]">Beauty OS</span>
          </span>
        </a>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className={cn("apple-glass-button rounded-full border border-[var(--color-border)] bg-white/50 px-5 py-3 text-sm font-bold transition duration-200 hover:bg-[var(--color-bordeaux)] hover:text-white", href === "#home" && "brand-action text-white")}>
              {label}
            </a>
          ))}
          <button type="button" onClick={onTry} className="apple-glass-button brand-action rounded-full px-6 py-3 text-sm font-bold text-white transition duration-200">
            Попробовать AI
          </button>
          <ThemeToggle />
        </nav>
        <button type="button" aria-label="Открыть меню" onClick={() => setOpen((value) => !value)} className="relative grid size-12 place-items-center rounded-full border border-white/20 bg-black text-white shadow-[0_14px_34px_rgba(0,0,0,.18)] md:hidden">
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </header>

      <div className={cn("fixed inset-0 z-[60] transition md:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
        <button type="button" aria-label="Закрыть меню" onClick={() => setOpen(false)} className={cn("absolute inset-0 bg-black/28 backdrop-blur-md transition duration-300", open ? "opacity-100" : "opacity-0")} />
        <aside className={cn("absolute right-0 top-0 z-10 flex h-full w-[86%] max-w-sm flex-col gap-4 overflow-y-auto border-l border-white/20 bg-[rgba(30,26,24,.9)] px-6 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] text-white shadow-2xl backdrop-blur-2xl transition duration-500", open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0")}>
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-white/38">Меню</p>
              <p className="mt-2 text-2xl font-black uppercase leading-none">Красавица</p>
            </div>
            <button type="button" aria-label="Закрыть меню" onClick={() => setOpen(false)} className="grid size-12 shrink-0 place-items-center rounded-full border border-white/18 bg-white text-black shadow-[0_18px_46px_rgba(0,0,0,.18)]">
              <X className="size-6" />
            </button>
          </div>
          {mobileLinks.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="apple-glass-button block rounded-full border border-white/18 bg-white/14 px-5 py-4 text-xl font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,.2)] backdrop-blur-2xl transition duration-300 hover:bg-white hover:text-black"
            >
              {label}
            </a>
          ))}
          <button type="button" onClick={() => { setOpen(false); onTry(); }} className="apple-glass-button mt-5 rounded-full bg-white px-6 py-4 text-sm font-bold text-black">
            Попробовать AI
          </button>
          <ThemeToggle className="mt-3 border-white/18 bg-white/10 text-white hover:bg-white hover:text-black" />
        </aside>
      </div>
    </>
  );
}

function TelegramPortalPanel() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={reveal}
      className="liquid-glass relative min-h-[480px] overflow-hidden rounded-[var(--radius-xl)] bg-[#FCFAFB]"
    >
      <div className="absolute inset-0">
        <Image
          src="/beauty-products-portal.png"
          alt=""
          fill
          sizes="(min-width: 768px) 55vw, 100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.96),rgba(255,255,255,.78)_42%,rgba(255,255,255,.28)),radial-gradient(circle_at_15%_15%,rgba(255,255,255,.9),transparent_34%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/80 to-transparent" />

      <div className="relative z-10 flex min-h-[480px] flex-col justify-center p-5 md:p-6">
        <div className="liquid-glass max-w-3xl rounded-[var(--radius-lg)] border border-white/60 bg-white/44 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.86),0_24px_80px_rgba(29,29,31,.08)] backdrop-blur-2xl md:p-6">
          <p className="text-xs font-black uppercase tracking-wide text-black/45">Telegram</p>
          <h2 className="mt-4 max-w-2xl text-[clamp(2.25rem,4.4vw,4.6rem)] font-semibold leading-[0.96] tracking-tight">
            Продолжайте подбор в удобном чате
          </h2>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-black/55">
            Бот и канал остаются быстрым входом в Красавицу, а сайт становится главным интерфейсом Beauty OS.
          </p>
          <div className="mt-6 grid gap-2 md:grid-cols-2">
            <TelegramCard href="https://t.me/krasavitsa_ai_bot" title="Telegram-бот" text="Запустить AI-подбор в чате." />
            <TelegramCard href="https://t.me/krasavitsa_ai" title="Канал" text="Следить за обновлениями Beauty OS." />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PortalTile({ children, className, delay = 0, hero = false }: { children: ReactNode; className?: string; delay?: number; hero?: boolean }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={reveal}
      transition={{ duration: 0.62, delay }}
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)]",
        hero && "portal-animated-bg",
        !hero && "bg-[url('/beauty-portal-hero.png')] bg-cover bg-center bg-no-repeat",
        className,
      )}
    >
      {hero ? (
        <div className="hero-image-layer absolute inset-0">
          <Image
            src="/beauty-portal-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ) : null}
      <div className={cn("absolute inset-0 bg-white/45 backdrop-blur-[1px]", hero && "bg-white/18")} />
      <div className="absolute inset-0 [background:linear-gradient(110deg,rgba(255,255,255,.8),rgba(255,255,255,.18)_45%,rgba(255,255,255,.55))]" />
      <div className={cn("relative z-10 flex h-full items-center justify-center", hero && "block")}>{children}</div>
    </motion.div>
  );
}

function TelegramCard({ href, title, text }: { href: string; title: string; text: string }) {
  const isBot = title.toLowerCase().includes("бот");

  return (
    <motion.a href={href} target="_blank" rel="noreferrer" whileHover={{ y: -5, scale: 1.014 }} whileTap={{ scale: 0.982 }} transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }} className="apple-glass-card group rounded-2xl border border-white/62 bg-white/68 p-5 shadow-[var(--shadow-card)] backdrop-blur-2xl transition duration-500 hover:bg-white/82">
      <div className="mb-8 flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-2xl border border-black/10 bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,.86)] backdrop-blur-xl">
          {isBot ? (
            <Image src="/telegram-bot-icon.png" alt="" width={28} height={28} className="size-7 object-contain" />
          ) : (
            <Send className="size-6 -rotate-12 stroke-[2.4]" />
          )}
        </span>
        <span className="grid size-11 place-items-center rounded-full border border-black/20 bg-white/40 transition duration-500 group-hover:bg-black group-hover:text-white">
          <ArrowRight className="size-5 -rotate-45" />
        </span>
      </div>
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-2 text-sm font-semibold text-black/55">{text}</p>
    </motion.a>
  );
}

function Footer() {
  return (
    <footer id="contacts" className="px-3 pb-5 pt-2 md:px-5">
      <div className="rounded-2xl border border-black/5 bg-white/70 p-6 text-sm font-semibold text-black/55 shadow-[inset_0_1px_0_rgba(255,255,255,.86),0_20px_70px_rgba(29,29,31,.05)] backdrop-blur-2xl md:p-8">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image src="/krasavitsa-logo.png" alt="Красавица" width={42} height={42} className="rounded-full" />
              <div>
                <p className="text-lg font-black uppercase text-black">Красавица</p>
                <p className="mt-1 text-xs font-normal uppercase text-black/38">Beauty OS</p>
              </div>
            </div>
            <p className="mt-5 max-w-xl leading-6">
              AI-сервис для подбора косметического ухода. Рекомендации носят информационный характер и не заменяют консультацию врача или косметолога.
            </p>
            <p className="mt-4 text-xs text-black/38">© 2026 Красавица Beauty OS</p>
          </div>

          <div>
            <p className="text-xs font-black uppercase text-black/40">Справка</p>
            <div className="mt-4 grid gap-3">
              <a href="#ai" className="hover:text-black">AI-подбор ухода</a>
              <a href="#features" className="hover:text-black">Возможности</a>
              <a href="https://t.me/krasavitsa_ai_bot" target="_blank" rel="noreferrer" className="hover:text-black">Telegram Bot</a>
              <a href="https://t.me/krasavitsa_ai" target="_blank" rel="noreferrer" className="hover:text-black">Telegram Channel</a>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase text-black/40">Документы</p>
            <div className="mt-4 grid gap-3">
              <a href="/privacy" className="hover:text-black">Политика конфиденциальности</a>
              <a href="/personal-data" className="hover:text-black">Согласие на обработку данных</a>
              <a href="/terms" className="hover:text-black">Пользовательское соглашение</a>
              <a href="https://t.me/thesp3cial" target="_blank" rel="noreferrer" className="hover:text-black">Разработчик: @thesp3cial</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
