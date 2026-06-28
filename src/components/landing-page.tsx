"use client";

import Image from "next/image";
import {
  ArrowRight,
  Bot,
  Copy,
  ExternalLink,
  Loader2,
  Menu,
  MessageCircle,
  Send,
  Star,
  ThumbsDown,
  ThumbsUp,
  WandSparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Product = {
  name: string;
  category: string;
  reason: string;
  rating: number;
  marketplace: string;
};

type RecommendationResponse = {
  mode?: "preview";
  summary: string;
  products: Product[];
};

const featureBars = [
  ["AI-подбор ухода", "Подобрать уход по запросу"],
  ["Beauty-профиль", "Сохранить контекст кожи"],
  ["Рейтинг сообщества", "Сравнить средства"],
];
const suggestions = [
  "Подбери уход для жирной кожи до 1500 рублей",
  "Нужна мягкая база для чувствительной кожи",
  "Собери вечерний уход против сухости до 3000 рублей",
];

const sampleProducts: Product[] = [
  {
    name: "Round Lab Birch Juice Moisturizing Cream",
    category: "Крем",
    reason: "Легкий финиш, поддержка барьера и комфорт без перегруза.",
    rating: 4.8,
    marketplace: "https://market.yandex.ru/",
  },
  {
    name: "Beauty of Joseon Green Plum Cleanser",
    category: "Очищение",
    reason: "Мягкая ежедневная база для ухода утром и вечером.",
    rating: 4.7,
    marketplace: "https://www.ozon.ru/",
  },
];

const features = [
  ["Запрос", "AI понимает тип кожи, бюджет, цель и ограничения."],
  ["Подбор", "Средства собираются в понятные карточки с причиной выбора."],
  ["Оценка", "Реакции пользователя улучшают будущие рекомендации."],
  ["Профиль", "История формирует персональную Beauty OS."],
];

const roadmap = [
  {
    label: "Сегодня",
    title: "AI-подбор ухода",
    text: "Главный сценарий уже на сайте: пользователь описывает задачу и получает подборку средств с объяснением.",
    action: "Попробовать подбор",
    metric: "Live",
  },
  {
    label: "Скоро",
    title: "Beauty-профиль",
    text: "Тип кожи, бюджет, реакции и история рекомендаций будут собираться в один персональный профиль.",
    action: "Посмотреть логику",
    metric: "Profile",
  },
  {
    label: "Затем",
    title: "Рейтинг сообщества",
    text: "Оценки пользователей помогут понять, какие средства действительно работают для похожих запросов.",
    action: "Оценить подборку",
    metric: "Rating",
  },
  {
    label: "Позже",
    title: "Парфюм",
    text: "Отдельный модуль для подбора ароматов по настроению, нотам и контексту использования.",
    action: "Оставить запрос",
    metric: "Scent",
  },
  {
    label: "Будущее",
    title: "Единая экосистема",
    text: "Красавица объединит уход, парфюм, каталог, профиль и историю решений в одном Beauty OS.",
    action: "Начать с AI",
    metric: "OS",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export function LandingPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [votes, setVotes] = useState<Record<string, "up" | "down">>({});
  const [selectedRoadmap, setSelectedRoadmap] = useState(0);
  const [result, setResult] = useState<RecommendationResponse>({
    summary: "Beauty OS готова собрать подборку. Опишите кожу, бюджет и желаемый эффект.",
    products: sampleProducts,
  });
  const aiRef = useRef<HTMLElement | null>(null);

  const currentProducts = useMemo(
    () => (result.products?.length ? result.products : sampleProducts),
    [result],
  );

  function focusAi(prefill?: string) {
    if (prefill) {
      setQuery(prefill);
    }
    aiRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submitRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const responseText = await response.text();
      let data: RecommendationResponse & { error?: string } = {
        summary: "Сервис вернул пустой ответ. Попробуйте еще раз.",
        products: sampleProducts,
      };

      if (responseText) {
        data = JSON.parse(responseText);
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось получить подборку");
      }

      setResult(data);
      setNotice(data.mode === "preview" ? "Preview-режим активен. Подключите live API на сервере." : "Подборка обновлена.");
    } catch (caught) {
      setNotice(caught instanceof Error ? caught.message : "Не удалось получить подборку");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyName(name: string) {
    await navigator.clipboard.writeText(name);
    setNotice(`Скопировано: ${name}`);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-black">
      <AnimatePresence>{showSplash ? <SplashScreen onComplete={() => setShowSplash(false)} /> : null}</AnimatePresence>
      <Header onTry={() => focusAi()} />

      <section id="home" className="grid min-h-screen gap-2 px-3 pb-2 pt-24 md:grid-rows-[auto_1fr] md:px-5">
        <div className="grid gap-2 md:grid-cols-3">
          {featureBars.map(([label, action], index) => (
            <PortalTile key={label} delay={index * 0.08} className="h-16 md:h-20">
              <button
                type="button"
                onClick={() => focusAi(action)}
                className="relative z-10 flex h-full w-full items-center justify-center px-4 text-center transition duration-200 hover:scale-[1.02]"
              >
                <span>
                  <span className="block text-xl font-black md:text-3xl">{label}</span>
                  <span className="mt-1 hidden text-xs font-bold text-black/45 md:block">{action}</span>
                </span>
              </button>
            </PortalTile>
          ))}
        </div>

        <PortalTile className="relative min-h-[720px] overflow-hidden md:min-h-0" delay={0.25} hero>
          <div className="absolute left-5 top-5 z-10 max-w-[260px] text-sm font-semibold leading-5 md:left-8 md:top-8">
            AI-платформа для осознанного выбора косметики и будущая единая Beauty OS.
          </div>
          <div className="absolute bottom-44 left-4 z-10 md:bottom-20 md:left-8">
            <h1 className="max-w-5xl text-[clamp(3.9rem,10.4vw,9.8rem)] font-black leading-[0.9] tracking-tight">
              Красавица
            </h1>
            <p className="mt-6 text-xl font-normal uppercase leading-none text-black/35 md:text-3xl">
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

      <section ref={aiRef} id="ai" className="grid min-h-screen gap-2 px-3 pb-2 pt-2 md:grid-cols-[0.88fr_1.12fr] md:px-5">
        <motion.form
          onSubmit={submitRecommendation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          className="relative overflow-hidden rounded-2xl bg-black p-5 text-white md:p-8"
        >
          <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_20%_10%,rgba(255,255,255,.22),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(245,140,168,.30),transparent_34%)]" />
          <div className="relative z-10 flex h-full min-h-[560px] flex-col justify-between gap-6">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <Image src="/krasavitsa-logo.png" alt="Красавица" width={54} height={54} className="rounded-full bg-white" />
                <div>
                  <p className="text-sm font-bold uppercase text-white/60">AI-подбор</p>
                  <h2 className="text-4xl font-black leading-none md:text-6xl">Beauty Search</h2>
                </div>
              </div>
              <textarea
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Например: "Подбери уход для жирной кожи до 1500 рублей"'
                className="min-h-48 w-full resize-none rounded-2xl border border-white/15 bg-white/10 p-5 text-lg leading-7 text-white outline-none backdrop-blur-xl transition duration-200 placeholder:text-white/45 focus:border-white/60 focus:bg-white/15"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-xl transition duration-200 hover:bg-white hover:text-black"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              {notice ? <p className="mb-3 text-sm text-white/70">{notice}</p> : null}
              <Button type="submit" disabled={isLoading} className="h-14 w-full bg-white text-black hover:bg-white/85 disabled:opacity-70">
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                Найти уход
              </Button>
            </div>
          </div>
        </motion.form>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          transition={{ delay: 0.12 }}
          className="relative overflow-hidden rounded-2xl bg-[url('/beauty-portal-hero.png')] bg-cover bg-center p-3"
        >
          <div className="grid min-h-[680px] gap-2 md:grid-rows-[0.7fr_1fr]">
            <div className="grid gap-2 md:grid-cols-3">
              {features.slice(0, 3).map(([title, text]) => (
                <GlassPanel key={title}>
                  <p className="text-sm font-bold uppercase text-black/45">{title}</p>
                  <p className="mt-4 text-xl font-black leading-tight">{text}</p>
                </GlassPanel>
              ))}
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <GlassPanel className="bg-white/90">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase text-black/45">AI-вывод</p>
                    <p className="mt-2 text-lg font-semibold leading-7">{result.summary}</p>
                  </div>
                  <Bot className="size-10 shrink-0" />
                </div>
                <div className="grid gap-2">
                  {currentProducts.map((product) => (
                    <ProductCard
                      key={product.name}
                      product={product}
                      vote={votes[product.name]}
                      onVote={(vote) => {
                        setVotes((current) => ({ ...current, [product.name]: vote }));
                        setNotice(vote === "up" ? "Оценка учтена." : "Отметила как неподходящее.");
                      }}
                      onCopy={() => copyName(product.name)}
                    />
                  ))}
                </div>
              </GlassPanel>
              <GlassPanel className="justify-between bg-black/45 text-white">
                <div>
                  <p className="text-sm font-bold uppercase text-white/55">Live Portal</p>
                  <h3 className="mt-4 text-[clamp(3rem,7vw,6rem)] font-black leading-[0.9]">
                    Care
                    <br />
                    System
                  </h3>
                </div>
                <div className="grid gap-2">
                  <ActionLink href="https://t.me/krasavitsa_ai_bot">Открыть Telegram-бот</ActionLink>
                  <ActionLink href="https://t.me/krasavitsa_ai">Открыть Telegram-канал</ActionLink>
                </div>
              </GlassPanel>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="grid min-h-screen gap-2 px-3 pb-2 pt-2 md:grid-cols-2 md:px-5">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} className="rounded-2xl bg-stone-50 p-6 md:p-8">
          <p className="text-sm font-black uppercase text-black/45">Возможности</p>
          <h2 className="mt-5 text-[clamp(3.6rem,8vw,7rem)] font-black leading-[0.9]">
            Beauty
            <br />
            Engine
          </h2>
          <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-black/60">
            Платформа готова к каталогу средств, личному кабинету, истории рекомендаций и модулю парфюма.
          </p>
        </motion.div>
        <div className="grid gap-2">
          {features.map(([title, text], index) => (
            <motion.button
              key={title}
              type="button"
              onClick={() => {
                setNotice(`${title}: модуль будет раскрыт в следующей версии.`);
                focusAi();
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={reveal}
              transition={{ delay: index * 0.06 }}
              className="group flex items-center justify-between rounded-2xl bg-black p-6 text-left text-white transition duration-200 hover:scale-[1.01] hover:bg-neutral-900"
            >
              <span>
                <span className="block text-3xl font-black">{title}</span>
                <span className="mt-2 block text-sm font-semibold text-white/60">{text}</span>
              </span>
              <span className="grid size-12 place-items-center rounded-full border border-white/40 transition duration-200 group-hover:bg-white group-hover:text-black">
                <ArrowRight className="size-5 -rotate-45" />
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <section id="telegram" className="grid min-h-screen gap-2 px-3 pb-2 pt-2 md:grid-cols-[1fr_0.8fr] md:px-5">
        <PortalTile className="min-h-[560px]" delay={0}>
          <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
            <div>
              <p className="text-sm font-black uppercase text-black/45">Telegram</p>
              <h2 className="mt-5 text-[clamp(4rem,10vw,9rem)] font-black leading-[0.82]">
                Continue
                <br />
                in Chat
              </h2>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <TelegramCard href="https://t.me/krasavitsa_ai_bot" title="Telegram-бот" text="Запустить AI-подбор в чате." />
              <TelegramCard href="https://t.me/krasavitsa_ai" title="Канал" text="Следить за обновлениями Beauty OS." />
            </div>
          </div>
        </PortalTile>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="relative overflow-hidden rounded-2xl bg-[url('/beauty-portal-hero.png')] bg-cover bg-center p-3"
        >
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,.45),transparent_32%),linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.04))]" />
          <div className="relative z-10 flex min-h-[560px] flex-col justify-between rounded-2xl border border-white/20 bg-white/15 p-5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] backdrop-blur-2xl md:p-6">
            <div>
              <p className="text-sm font-black uppercase text-white/55">Roadmap</p>
              <h3 className="mt-4 text-[clamp(3rem,6vw,5.6rem)] font-black leading-[0.88]">
                Что будет
                <br />
                дальше
              </h3>
            </div>

            <div className="my-7 grid gap-2">
              {roadmap.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedRoadmap(index)}
                  className={cn(
                    "group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border p-4 text-left backdrop-blur-xl transition duration-200 hover:scale-[1.01]",
                    selectedRoadmap === index
                      ? "border-white bg-white text-black"
                      : "border-white/15 bg-white/12 text-white hover:bg-white/20",
                  )}
                >
                  <span className={cn("grid size-9 place-items-center rounded-full text-xs font-black", selectedRoadmap === index ? "bg-black text-white" : "bg-white/15 text-white")}>
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-black">{item.label}</span>
                    <span className={cn("mt-1 block text-xs font-semibold", selectedRoadmap === index ? "text-black/55" : "text-white/55")}>
                      {item.title}
                    </span>
                  </span>
                  <span className={cn("text-xs font-black uppercase", selectedRoadmap === index ? "text-black" : "text-white/65")}>
                    {item.metric}
                  </span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-white p-5 text-black">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-black/45">{roadmap[selectedRoadmap].label}</p>
                  <h4 className="mt-1 text-2xl font-black">{roadmap[selectedRoadmap].title}</h4>
                </div>
                <span className="rounded-full bg-black px-3 py-2 text-xs font-black uppercase text-white">
                  {roadmap[selectedRoadmap].metric}
                </span>
              </div>
              <p className="text-sm font-semibold leading-6 text-black/60">{roadmap[selectedRoadmap].text}</p>
              <button
                type="button"
                onClick={() => {
                  setNotice(`${roadmap[selectedRoadmap].label}: ${roadmap[selectedRoadmap].title}`);
                  focusAi(roadmap[selectedRoadmap].action);
                }}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-black px-5 text-sm font-black text-white transition duration-200 hover:scale-105"
              >
                {roadmap[selectedRoadmap].action}
                <ArrowRight className="size-4 -rotate-45" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCount((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          window.setTimeout(() => setExiting(true), 200);
          window.setTimeout(onComplete, 900);
          return 100;
        }
        return current + 1;
      });
    }, 18);

    return () => window.clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-[100] flex items-end justify-start bg-white p-6 transition-opacity duration-700 md:p-10",
        exiting && "opacity-0",
      )}
    >
      <span className="text-7xl font-black leading-none tabular-nums md:text-9xl">{count}</span>
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
    ["Home", "#home"],
    ["AI", "#ai"],
    ["Features", "#features"],
    ["Telegram", "#telegram"],
  ];

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-white/80 px-4 py-2 backdrop-blur-md md:px-6 md:py-3">
        <a href="#home" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image src="/krasavitsa-logo.png" alt="Красавица" width={48} height={48} className="rounded-full" priority />
          <span className="flex flex-col">
            <span className="text-xl font-black uppercase leading-none tracking-tight md:text-2xl">Красавица</span>
            <span className="mt-1 text-[9px] font-bold uppercase leading-none text-black/55">Beauty OS</span>
          </span>
        </a>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="rounded-full border border-black px-6 py-3 text-sm font-bold transition duration-200 hover:bg-black hover:text-white">
              {label}
            </a>
          ))}
          <button type="button" onClick={onTry} className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition duration-200 hover:bg-neutral-800">
            Попробовать AI
          </button>
        </nav>
        <button type="button" aria-label="Открыть меню" onClick={() => setOpen((value) => !value)} className="relative grid size-11 place-items-center rounded-full border border-black md:hidden">
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </header>

      <div className={cn("fixed inset-0 z-40 transition md:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
        <button type="button" aria-label="Закрыть меню" onClick={() => setOpen(false)} className={cn("absolute inset-0 bg-black/20 backdrop-blur-sm transition duration-300", open ? "opacity-100" : "opacity-0")} />
        <aside className={cn("absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col justify-center gap-2 bg-white px-8 shadow-2xl transition duration-500", open ? "translate-x-0" : "translate-x-full")}>
          {links.map(([label, href], index) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${100 + index * 60}ms` : "0ms" }}
              className={cn("text-4xl font-black transition duration-500", open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0")}
            >
              {label}
            </a>
          ))}
          <button type="button" onClick={() => { setOpen(false); onTry(); }} className="mt-8 rounded-full bg-black px-6 py-4 text-sm font-bold text-white">
            Попробовать AI
          </button>
        </aside>
      </div>
    </>
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
        "relative overflow-hidden rounded-2xl bg-[url('/beauty-portal-hero.png')] bg-cover bg-center bg-no-repeat shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)]",
        hero && "portal-animated-bg",
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-white/45 backdrop-blur-[1px]", hero && "bg-white/18")} />
      <div className="absolute inset-0 [background:linear-gradient(110deg,rgba(255,255,255,.8),rgba(255,255,255,.18)_45%,rgba(255,255,255,.55))]" />
      <div className={cn("relative z-10 flex h-full items-center justify-center", hero && "block")}>{children}</div>
    </motion.div>
  );
}

function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col rounded-2xl bg-white/75 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.55)] backdrop-blur-2xl", className)}>
      {children}
    </div>
  );
}

function ProductCard({ product, vote, onVote, onCopy }: { product: Product; vote?: "up" | "down"; onVote: (vote: "up" | "down") => void; onCopy: () => void }) {
  return (
    <article className="rounded-2xl border border-black/10 bg-white/85 p-4 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-black/45">{product.category}</p>
          <h3 className="mt-1 text-lg font-black">{product.name}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-black/55">{product.reason}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-black px-3 py-2 text-sm font-black text-white">
          <Star className="size-4 fill-white" />
          {product.rating}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={product.marketplace} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full bg-black px-4 text-sm font-bold text-white transition duration-200 hover:scale-105">
          Купить <ExternalLink className="size-4" />
        </a>
        <button type="button" onClick={onCopy} className="inline-flex h-9 items-center gap-2 rounded-full border border-black/15 px-4 text-sm font-bold transition duration-200 hover:bg-black hover:text-white">
          <Copy className="size-4" />
          Copy
        </button>
        <VoteButton active={vote === "up"} label="Подходит" onClick={() => onVote("up")}>
          <ThumbsUp className="size-4" />
        </VoteButton>
        <VoteButton active={vote === "down"} label="Не подходит" onClick={() => onVote("down")}>
          <ThumbsDown className="size-4" />
        </VoteButton>
      </div>
    </article>
  );
}

function VoteButton({ active, label, children, onClick }: { active: boolean; label: string; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={cn("grid size-9 place-items-center rounded-full border border-black/15 transition duration-200 hover:bg-black hover:text-white", active && "bg-black text-white")}>
      {children}
    </button>
  );
}

function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl bg-white/20 p-4 font-black backdrop-blur-xl transition duration-200 hover:scale-[1.02] hover:bg-white hover:text-black">
      {children}
      <ArrowRight className="size-5 -rotate-45" />
    </a>
  );
}

function TelegramCard({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group rounded-2xl bg-white/85 p-5 backdrop-blur-xl transition duration-200 hover:scale-[1.02] hover:bg-white">
      <div className="mb-8 flex items-center justify-between">
        <MessageCircle className="size-7" />
        <span className="grid size-11 place-items-center rounded-full border border-black transition duration-200 group-hover:bg-black group-hover:text-white">
          <ArrowRight className="size-5 -rotate-45" />
        </span>
      </div>
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-2 text-sm font-semibold text-black/55">{text}</p>
    </a>
  );
}

function Footer() {
  return (
    <footer className="flex flex-col gap-5 px-5 py-8 text-sm font-semibold text-black/55 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Image src="/krasavitsa-logo.png" alt="Красавица" width={42} height={42} className="rounded-full" />
        <span>© 2026 Красавица Beauty OS</span>
      </div>
      <div className="flex flex-wrap gap-5">
        <a href="https://t.me/thesp3cial" target="_blank" rel="noreferrer" className="hover:text-black">Разработчик: @thesp3cial</a>
        <a href="https://t.me/krasavitsa_ai_bot" target="_blank" rel="noreferrer" className="hover:text-black">Telegram Bot</a>
        <a href="https://t.me/krasavitsa_ai" target="_blank" rel="noreferrer" className="hover:text-black">Telegram Channel</a>
      </div>
    </footer>
  );
}
