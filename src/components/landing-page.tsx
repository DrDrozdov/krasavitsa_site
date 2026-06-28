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
import { BeautyPortalGrid, PortalPanel } from "@/components/portal-components";
import { cn } from "@/lib/utils";

type Product = {
  name: string;
  category: string;
  reason: string;
  rating: number;
  marketplace?: string;
  marketplaces?: MarketplaceLink[];
};

type MarketplaceLink = {
  label: string;
  href: string;
};

type RecommendationResponse = {
  mode?: "preview";
  summary: string;
  products: Product[];
};

const featureBars = [
  {
    label: "AI-подбор ухода",
    action: "Подобрать уход по запросу",
    title: "Умный подбор ухода",
    text: "Опишите кожу, бюджет и задачу. Красавица соберет понятную подборку и объяснит, зачем нужен каждый шаг.",
    cta: "Начать подбор",
  },
  {
    label: "Beauty-профиль",
    action: "Сохранить контекст кожи",
    title: "Будущий beauty-профиль",
    text: "Здесь будут храниться история подборов, параметры кожи, избранные средства и реакции, чтобы рекомендации становились точнее.",
    cta: "Посмотреть профиль",
  },
  {
    label: "Рейтинг сообщества",
    action: "Сравнить средства",
    title: "Рейтинг доверия",
    text: "Оценки пользователей помогут понять, какие средства чаще подходят людям с похожими запросами и ограничениями.",
    cta: "Оценить подборку",
  },
];
const suggestions = [
  "Подбери уход для жирной кожи до 1500 рублей",
  "Нужна мягкая база для чувствительной кожи",
  "Собери вечерний уход против сухости до 3000 рублей",
  "Сыворотка для сухой кожи до 1000 рублей",
  "Крем для чувствительной кожи без отдушек",
  "Умывание для комбинированной кожи до 1200 рублей",
  "SPF для города без жирного блеска",
  "База против покраснений на каждый день",
  "Легкий ночной уход после ретинола",
  "Подборка корейского ухода до 2500 рублей",
  "Тонер для восстановления барьера",
  "Уход после кислот без раздражения",
];

function buildMarketplaceLinks(name: string, provided?: MarketplaceLink[], fallback?: string): MarketplaceLink[] {
  const query = encodeURIComponent(name);
  const links: MarketplaceLink[] = [
    { label: "Я.Маркет", href: `https://market.yandex.ru/search?text=${query}` },
    { label: "Ozon", href: `https://www.ozon.ru/search/?text=${query}` },
    { label: "WB", href: `https://www.wildberries.ru/catalog/0/search.aspx?search=${query}` },
    { label: "ЗЯ", href: `https://goldapple.ru/search?q=${query}` },
    { label: "Лэтуаль", href: `https://www.letu.ru/search?q=${query}` },
  ];

  const validProvided = provided?.filter((item) => item.label && item.href) ?? [];
  const merged = fallback ? [{ label: "Магазин", href: fallback }, ...validProvided, ...links] : [...validProvided, ...links];
  return merged.filter((item, index, array) => array.findIndex((candidate) => candidate.href === item.href) === index).slice(0, 5);
}

const sampleProducts: Product[] = [
  {
    name: "Round Lab Birch Juice Moisturizing Cream",
    category: "Крем",
    reason: "Легкий финиш, поддержка барьера и комфорт без перегруза.",
    rating: 4.8,
    marketplaces: buildMarketplaceLinks("Round Lab Birch Juice Moisturizing Cream"),
  },
  {
    name: "Beauty of Joseon Green Plum Cleanser",
    category: "Очищение",
    reason: "Мягкая ежедневная база для ухода утром и вечером.",
    rating: 4.7,
    marketplaces: buildMarketplaceLinks("Beauty of Joseon Green Plum Cleanser"),
  },
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
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [activeModal, setActiveModal] = useState<(typeof featureBars)[number] | null>(null);
  const [result, setResult] = useState<RecommendationResponse>({
    summary: "Beauty OS готова собрать подборку. Опишите кожу, бюджет и желаемый эффект.",
    products: sampleProducts,
  });
  const aiRef = useRef<HTMLElement | null>(null);

  const currentProducts = useMemo(
    () => (result.products?.length ? result.products : sampleProducts),
    [result],
  );
  const visibleSuggestions = useMemo(
    () => [0, 1, 2].map((offset) => suggestions[(suggestionIndex + offset) % suggestions.length]),
    [suggestionIndex],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSuggestionIndex((current) => (current + 1) % suggestions.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

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
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {
            summary: "Сервис вернул ответ в неподходящем формате. Показываю безопасную демо-подборку.",
            products: sampleProducts,
          };
        }
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
          {featureBars.map((item, index) => (
            <FeaturePill key={item.label} delay={index * 0.08}>
              <button
                type="button"
                onClick={() => setActiveModal(item)}
                className="relative z-10 flex h-full w-full items-center justify-center px-4 text-center transition duration-200 hover:scale-[1.02]"
              >
                <span>
                  <span className="block text-xl font-black md:text-3xl">{item.label}</span>
                  <span className="mt-1 hidden text-xs font-bold text-black/45 md:block">{item.action}</span>
                </span>
              </button>
            </FeaturePill>
          ))}
        </div>

        <PortalTile className="relative min-h-[720px] overflow-hidden md:min-h-0" delay={0.25} hero>
          <div className="absolute left-5 top-5 z-10 max-w-[260px] text-sm font-semibold leading-5 md:left-8 md:top-8">
            Спокойный помощник для осознанного выбора ухода, бюджета и понятных рекомендаций.
          </div>
          <div className="absolute bottom-48 left-4 z-10 md:bottom-24 md:left-8">
            <h1 className="max-w-5xl text-[clamp(3.9rem,10.4vw,9.8rem)] font-black leading-[0.9] tracking-tight">
              Красавица
            </h1>
            <p className="mt-9 text-xl font-normal uppercase leading-none text-black/25 md:text-3xl">
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

      <section ref={aiRef} id="ai" className="px-3 pb-2 pt-2 md:px-5">
        <div className="grid gap-2 rounded-[var(--radius-xxl)] border border-[var(--color-border)] bg-[rgba(255,255,255,.54)] p-2 shadow-[var(--shadow-soft)] backdrop-blur-2xl md:grid-cols-[0.82fr_1.18fr]">
        <motion.form
          onSubmit={submitRecommendation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          className="liquid-glass relative overflow-hidden rounded-[var(--radius-lg)] border border-white/20 bg-[rgba(30,26,24,.88)] p-5 text-white md:p-6"
        >
          <div className="absolute inset-0 opacity-50 [background:radial-gradient(circle_at_20%_10%,rgba(255,255,255,.22),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(245,140,168,.30),transparent_34%)]" />
          <div className="relative z-10 flex min-h-[390px] flex-col justify-between gap-5">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <Image src="/krasavitsa-logo.png" alt="Красавица" width={44} height={44} className="rounded-full bg-white" />
                <div>
                  <p className="text-xs font-bold uppercase text-white/55">AI-подбор</p>
                  <h2 className="text-3xl font-black leading-none md:text-5xl">Beauty Search</h2>
                </div>
              </div>
              <textarea
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Например: "Подбери уход для жирной кожи до 1500 рублей"'
                className="min-h-32 w-full resize-none rounded-2xl border border-white/15 bg-white/10 p-4 text-base leading-7 text-white outline-none backdrop-blur-xl transition duration-200 placeholder:text-white/45 focus:border-white/60 focus:bg-white/15"
              />
              <div className="mt-4 flex min-h-[82px] flex-wrap content-start gap-2 md:min-h-[44px]">
                <AnimatePresence mode="popLayout">
                  {visibleSuggestions.map((item, index) => (
                    <motion.button
                      key={item}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.34, delay: index * 0.04 }}
                      type="button"
                      onClick={() => setQuery(item)}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="apple-glass-button rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur-xl transition duration-200 hover:bg-white hover:text-black"
                    >
                      {item}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div>
              {notice ? <p className="mb-3 text-sm text-white/70">{notice}</p> : null}
              <Button type="submit" disabled={isLoading} className="h-12 w-full bg-white text-black hover:bg-white/85 disabled:opacity-70">
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
          className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[url('/beauty-portal-hero.png')] bg-cover bg-center p-2"
        >
          <div className="grid min-h-[390px] gap-2 md:grid-cols-[1fr_0.72fr]">
              <GlassPanel className="bg-white/88">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-black/45">AI-вывод</p>
                    <p className="mt-2 text-base font-semibold leading-7">{result.summary}</p>
                  </div>
                  <Bot className="size-8 shrink-0" />
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
              <GlassPanel className="justify-between bg-white/28 text-white">
                <div>
                  <p className="text-xs font-bold uppercase text-white/65">Live Portal</p>
                  <h3 className="mt-3 text-[clamp(2.3rem,4vw,4.2rem)] font-black leading-[0.92]">
                    Уход рядом с запросом
                  </h3>
                  <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-white/70">
                    Результаты появляются сразу возле формы, без лишних пустых экранов.
                  </p>
                </div>
                <div className="grid gap-2">
                  <ActionLink href="https://t.me/krasavitsa_ai_bot">Открыть Telegram-бот</ActionLink>
                  <ActionLink href="https://t.me/krasavitsa_ai">Открыть Telegram-канал</ActionLink>
                </div>
              </GlassPanel>
          </div>
        </motion.div>
        </div>
      </section>

      <HomeEditorialSections onStart={() => focusAi("Помоги собрать уход без случайных покупок")} />

      <section id="telegram" className="grid gap-2 px-3 pb-2 pt-2 md:grid-cols-[1fr_0.9fr] md:px-5">
        <TelegramPortalPanel />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="liquid-glass relative overflow-hidden rounded-[var(--radius-xl)] bg-[url('/beauty-products-portal.png')] bg-cover bg-center bg-no-repeat p-2"
        >
          <div className="absolute inset-0 bg-black/34" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,.38),transparent_32%),linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.06))]" />
          <div className="relative z-10 flex min-h-[480px] flex-col justify-between rounded-[var(--radius-lg)] border border-white/24 bg-white/18 p-5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] backdrop-blur-2xl md:p-6">
            <div>
              <p className="text-xs font-black uppercase text-white/62">Roadmap</p>
              <h3 className="mt-3 text-[clamp(2.5rem,4.7vw,4.4rem)] font-black leading-[0.9]">
                Что будет
                <br />
                дальше
              </h3>
            </div>

            <div className="my-5 grid gap-2">
              {roadmap.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedRoadmap(index)}
                  className={cn(
                    "liquid-glass group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border p-3 text-left backdrop-blur-xl transition duration-200 hover:scale-[1.01]",
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

            <div className="liquid-glass rounded-2xl bg-white/90 p-4 text-black backdrop-blur-2xl">
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
                  setNotice(`${roadmap[selectedRoadmap].label}: ${roadmap[selectedRoadmap].title}`);
                  focusAi(roadmap[selectedRoadmap].action);
                }}
                className="apple-glass-button mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-sm font-black text-white transition duration-200 hover:scale-105"
              >
                {roadmap[selectedRoadmap].action}
                <ArrowRight className="size-4 -rotate-45" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
      <SoftModal
        item={activeModal}
        onClose={() => setActiveModal(null)}
        onPrimary={(item) => {
          setActiveModal(null);
          if (item.label === "Beauty-профиль") {
            window.location.href = "/profile";
            return;
          }
          focusAi(item.action);
        }}
      />
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

  return (
    <section className="px-3 pb-2 pt-2 md:px-5">
      <BeautyPortalGrid className="min-h-0 max-w-none">
        <PortalPanel className="md:col-span-5">
          <div className="flex min-h-[380px] flex-col justify-between">
            <div>
              <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Подбор ухода</p>
              <h2 className="mt-4 max-w-2xl text-[clamp(2.7rem,5.1vw,5.4rem)] font-black leading-[0.92] tracking-tight">
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
          </div>
        </PortalPanel>
        <PortalPanel className="md:col-span-4 md:row-span-2" image="/beauty-products-portal.png">
          <div className="flex h-full min-h-[380px] items-end">
            <div className="liquid-glass rounded-[var(--radius-lg)] border border-white/60 bg-white/46 p-4 backdrop-blur-2xl">
              <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Beauty-портал</p>
              <p className="mt-2 text-xl font-black leading-tight">Запрос, подбор, объяснение и сохранение.</p>
            </div>
          </div>
        </PortalPanel>
        <PortalPanel className="md:col-span-3">
          <div className="grid h-full gap-3">
            {steps.slice(0, 2).map(([title, text], index) => (
              <StepCard key={title} index={index + 1} title={title} text={text} />
            ))}
          </div>
        </PortalPanel>
        <PortalPanel className="md:col-span-3">
          <div className="grid h-full gap-3">
            {steps.slice(2).map(([title, text], index) => (
              <StepCard key={title} index={index + 3} title={title} text={text} />
            ))}
          </div>
        </PortalPanel>
      </BeautyPortalGrid>
    </section>
  );
}

function StepCard({ index, title, text }: { index: number; title: string; text: string }) {
  return (
    <div className="liquid-glass rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white/50 p-4 backdrop-blur-xl">
      <p className="text-xs font-black text-[var(--color-text-soft)]">0{index}</p>
      <h3 className="mt-2 text-xl font-black leading-tight">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{text}</p>
    </div>
  );
}

function HomeEditorialSections({ onStart }: { onStart: () => void }) {
  const concerns = ["Жирный блеск", "Сухость", "Покраснения", "Акне", "SPF", "Восстановление барьера"];
  const faq = [
    ["Это заменяет косметолога?", "Нет. Красавица помогает разобраться с уходом и покупками, но не ставит диагнозы и не обещает лечение."],
    ["Можно указать бюджет?", "Да. Бюджет — один из главных параметров подбора, чтобы рекомендации были реалистичными."],
    ["Где сохраняются рекомендации?", "Сейчас удобнее продолжать в Telegram. В профиле на сайте появится история подборов и избранное."],
  ];

  return (
    <>
      <section className="px-3 pb-2 pt-2 md:px-5">
        <div className="grid gap-2 md:grid-cols-[0.9fr_1.1fr]">
          <div className="liquid-glass rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-glass)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl md:p-6">
            <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Что вас беспокоит?</p>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,4.2rem)] font-black leading-[0.96] tracking-tight">
              Выберите задачу, а не случайный тренд
            </h2>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
              Подбор строится вокруг реального запроса: состояния кожи, бюджета, текущего ухода и ограничений.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {concerns.map((item) => (
              <button key={item} type="button" onClick={onStart} className="liquid-glass apple-glass-card rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/54 p-5 text-left text-xl font-black shadow-[var(--shadow-card)] backdrop-blur-2xl">
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-2 px-3 pb-2 pt-2 md:grid-cols-3 md:px-5">
        {[
          ["Что умеет Красавица", "Собирает рекомендации, объясняет роль каждого шага, учитывает бюджет и помогает не перегружать уход."],
          ["Подбор парфюма", "Будущий модуль поможет выбирать аромат под настроение, повод и стиль, без холодной технической подачи."],
          ["Отзывы и доверие", "Реакции пользователей будут превращаться в рейтинг средств и помогать будущим подборкам."],
        ].map(([title, text]) => (
          <article key={title} className="liquid-glass apple-glass-card rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-glass)] p-5 shadow-[var(--shadow-card)] backdrop-blur-2xl md:p-6">
            <h2 className="text-[clamp(1.8rem,2.7vw,3rem)] font-black leading-[1] tracking-tight">{title}</h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{text}</p>
          </article>
        ))}
      </section>

      <section className="px-3 pb-2 pt-2 md:px-5">
        <div className="liquid-glass rounded-[var(--radius-xl)] border border-white/12 bg-[rgba(30,26,24,.9)] p-5 text-white shadow-[var(--shadow-soft)] md:p-6">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <div>
              <p className="text-xs font-black uppercase text-white/45">FAQ</p>
              <h2 className="mt-3 text-[clamp(2.2rem,4vw,4.4rem)] font-black leading-[0.94]">Перед первым подбором</h2>
            </div>
            <div className="grid gap-2">
              {faq.map(([question, answer]) => (
                <details key={question} className="rounded-[var(--radius-lg)] border border-white/12 bg-white/10 p-4 backdrop-blur-xl">
                  <summary className="cursor-pointer text-base font-black">{question}</summary>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white/62">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 pb-2 pt-2 md:px-5">
        <div className="liquid-glass flex flex-col justify-between gap-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-glass-strong)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl md:flex-row md:items-center md:p-6">
          <div>
            <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Финальный шаг</p>
            <h2 className="mt-2 text-[clamp(2.1rem,3.5vw,3.8rem)] font-black leading-none">Собрать уход сейчас</h2>
          </div>
          <Button onClick={onStart} className="h-12 w-fit px-6">
            Начать подбор
          </Button>
        </div>
      </section>
    </>
  );
}

function SoftModal({
  item,
  onClose,
  onPrimary,
}: {
  item: (typeof featureBars)[number] | null;
  onClose: () => void;
  onPrimary: (item: (typeof featureBars)[number]) => void;
}) {
  useEffect(() => {
    if (!item) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item ? (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/18 p-3 backdrop-blur-md md:items-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Закрыть окно" className="absolute inset-0" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl rounded-[32px] border border-white/60 bg-[rgba(255,253,251,.82)] p-6 shadow-[var(--shadow-glass)] backdrop-blur-2xl md:p-8"
          >
            <button type="button" aria-label="Закрыть" onClick={onClose} className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-[var(--color-border)] bg-white/60 text-xl font-black">
              <X className="size-5" />
            </button>
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">{item.label}</p>
            <h2 className="mt-4 max-w-xl text-[clamp(2.4rem,6vw,4.8rem)] font-black leading-[0.94] tracking-tight">{item.title}</h2>
            <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-[var(--color-text-muted)]">{item.text}</p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={() => onPrimary(item)} className="h-13 px-6">
                {item.cta}
              </Button>
              <LinkButton href="https://t.me/krasavitsa_ai_bot" tone="secondary" className="h-13 px-6">
                <MessageCircle className="size-5" />
                Telegram
              </LinkButton>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
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
    ["Главная", "#home"],
    ["Подбор ухода", "/care"],
    ["Парфюм", "/perfume"],
    ["Блог", "/blog"],
    ["Профиль", "/profile"],
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
            <a key={href} href={href} className="apple-glass-button rounded-full border border-black/15 bg-white/50 px-5 py-3 text-sm font-bold transition duration-200 hover:bg-black hover:text-white">
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

function FeaturePill({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={reveal}
      transition={{ duration: 0.62, delay }}
      whileHover={{ y: -4, scale: 1.012 }}
      whileTap={{ scale: 0.992 }}
      className="feature-pill group relative h-16 overflow-hidden rounded-2xl border border-black/5 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_18px_60px_rgba(29,29,31,.05)] backdrop-blur-2xl md:h-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.95),transparent_36%),linear-gradient(120deg,rgba(255,255,255,.74),rgba(246,242,244,.42),rgba(255,255,255,.7))]" />
      <div className="absolute left-6 top-1/2 h-12 w-24 -translate-y-1/2 rounded-full bg-[#FBC9D6]/25 blur-2xl" />
      <div className="absolute right-6 top-1/2 h-10 w-20 -translate-y-1/2 rounded-full bg-white/70 blur-xl" />
      {children}
    </motion.div>
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

function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.004 }}
      whileTap={{ scale: 0.992 }}
      className={cn("apple-glass-card flex flex-col rounded-2xl bg-white/75 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.55)] backdrop-blur-2xl", className)}
    >
      {children}
    </motion.div>
  );
}

function ProductCard({ product, vote, onVote, onCopy }: { product: Product; vote?: "up" | "down"; onVote: (vote: "up" | "down") => void; onCopy: () => void }) {
  const marketplaceLinks = buildMarketplaceLinks(product.name, product.marketplaces, product.marketplace);

  return (
    <motion.article
      whileHover={{ y: -3, scale: 1.006 }}
      whileTap={{ scale: 0.99 }}
      className="apple-glass-card rounded-2xl border border-black/10 bg-white/85 p-4 backdrop-blur-xl"
    >
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
        {marketplaceLinks.map((link, index) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-bold transition duration-200 hover:scale-105",
              index === 0 ? "bg-black text-white" : "border border-black/15 bg-white/60 text-black hover:bg-black hover:text-white",
            )}
          >
            {link.label}
            <ExternalLink className="size-4" />
          </a>
        ))}
        <button type="button" onClick={onCopy} className="inline-flex h-9 items-center gap-2 rounded-full border border-black/15 px-4 text-sm font-bold transition duration-200 hover:bg-black hover:text-white">
          <Copy className="size-4" />
          Название
        </button>
        <VoteButton active={vote === "up"} label="Подходит" onClick={() => onVote("up")}>
          <ThumbsUp className="size-4" />
        </VoteButton>
        <VoteButton active={vote === "down"} label="Не подходит" onClick={() => onVote("down")}>
          <ThumbsDown className="size-4" />
        </VoteButton>
      </div>
    </motion.article>
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
    <motion.a href={href} target="_blank" rel="noreferrer" whileHover={{ y: -2, scale: 1.012 }} whileTap={{ scale: 0.986 }} className="apple-glass-card flex items-center justify-between rounded-2xl bg-white/20 p-4 font-black backdrop-blur-xl transition duration-200 hover:bg-white hover:text-black">
      {children}
      <ArrowRight className="size-5 -rotate-45" />
    </motion.a>
  );
}

function TelegramCard({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <motion.a href={href} target="_blank" rel="noreferrer" whileHover={{ y: -4, scale: 1.012 }} whileTap={{ scale: 0.986 }} className="apple-glass-card group rounded-2xl bg-white/85 p-5 backdrop-blur-xl transition duration-200 hover:bg-white">
      <div className="mb-8 flex items-center justify-between">
        <MessageCircle className="size-7" />
        <span className="grid size-11 place-items-center rounded-full border border-black transition duration-200 group-hover:bg-black group-hover:text-white">
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
    <footer className="px-3 pb-5 pt-2 md:px-5">
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
