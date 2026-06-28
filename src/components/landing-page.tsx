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
  ratingSource?: string;
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
    ratingSource: "По оценкам пользователей Яндекс Маркет",
    marketplaces: buildMarketplaceLinks("Round Lab Birch Juice Moisturizing Cream"),
  },
  {
    name: "Beauty of Joseon Green Plum Cleanser",
    category: "Очищение",
    reason: "Мягкая ежедневная база для ухода утром и вечером.",
    rating: 4.7,
    ratingSource: "По оценкам пользователей Яндекс Маркет",
    marketplaces: buildMarketplaceLinks("Beauty of Joseon Green Plum Cleanser"),
  },
  {
    name: "La Roche-Posay Cicaplast Baume B5+",
    category: "Восстановление",
    reason: "Плотный успокаивающий бальзам для барьера, сухости и раздражения.",
    rating: 4.9,
    ratingSource: "По оценкам пользователей Яндекс Маркет",
    marketplaces: buildMarketplaceLinks("La Roche-Posay Cicaplast Baume B5+"),
  },
  {
    name: "COSRX Advanced Snail 96 Mucin Power Essence",
    category: "Эссенция",
    reason: "Легкий слой увлажнения и гладкости без тяжелой пленки.",
    rating: 4.8,
    ratingSource: "По оценкам пользователей Яндекс Маркет",
    marketplaces: buildMarketplaceLinks("COSRX Advanced Snail 96 Mucin Power Essence"),
  },
  {
    name: "Beauty of Joseon Relief Sun SPF50+",
    category: "SPF",
    reason: "Ежедневная защита с мягким финишем для города.",
    rating: 4.8,
    ratingSource: "По оценкам пользователей Яндекс Маркет",
    marketplaces: buildMarketplaceLinks("Beauty of Joseon Relief Sun SPF50+"),
  },
  {
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    category: "Сыворотка",
    reason: "Поддержка кожи при блеске и неровном тоне в простой схеме.",
    rating: 4.7,
    ratingSource: "По оценкам пользователей Яндекс Маркет",
    marketplaces: buildMarketplaceLinks("The Ordinary Niacinamide 10% + Zinc 1%"),
  },
];

const roadmap = [
  {
    label: "Сейчас",
    title: "AI-подбор ухода",
    text: "Главный сценарий уже на сайте: пользователь описывает задачу и получает подборку средств с объяснением.",
    action: "Попробовать подбор",
    metric: "Live",
  },
  {
    label: "Профиль",
    title: "Beauty-профиль",
    text: "Тип кожи, бюджет, реакции и история рекомендаций будут собираться в один персональный профиль.",
    action: "Посмотреть логику",
    metric: "Profile",
  },
  {
    label: "Сообщество",
    title: "Рейтинг средств",
    text: "Оценки пользователей помогут понять, какие средства действительно работают для похожих запросов.",
    action: "Оценить подборку",
    metric: "Rating",
  },
  {
    label: "Ароматы",
    title: "Подбор парфюма",
    text: "Отдельный модуль для подбора ароматов по настроению, нотам и контексту использования.",
    action: "Оставить запрос",
    metric: "Scent",
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
  const [result, setResult] = useState<RecommendationResponse>({
    summary: "Beauty OS готова собрать подборку. Опишите кожу, бюджет и желаемый эффект.",
    products: sampleProducts,
  });
  const aiRef = useRef<HTMLElement | null>(null);

  const currentProducts = useMemo(
    () => {
      const source = result.products?.length ? result.products : sampleProducts;
      if (source.length <= 2) {
        return source;
      }
      return [0, 1].map((offset) => source[(suggestionIndex + offset) % source.length]);
    },
    [result, suggestionIndex],
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

      <section ref={aiRef} id="ai" className="px-3 pb-2 pt-2 md:px-5">
        <div className="grid gap-2 rounded-[var(--radius-xxl)] border border-[var(--color-border)] bg-[rgba(255,255,255,.54)] p-2 shadow-[var(--shadow-soft)] backdrop-blur-2xl md:grid-cols-[0.82fr_1.18fr]">
        <motion.form
          onSubmit={submitRecommendation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          className="search-panel liquid-glass relative overflow-hidden rounded-[var(--radius-lg)] border border-white/20 bg-[rgba(30,26,24,.9)] p-5 text-white md:p-6"
        >
          <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_18%_12%,rgba(255,255,255,.16),transparent_32%),radial-gradient(circle_at_86%_0%,rgba(235,199,183,.28),transparent_34%),linear-gradient(135deg,rgba(30,26,24,.95),rgba(30,26,24,.78))]" />
          <div className="relative z-10 flex min-h-[390px] flex-col justify-between gap-5">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <Image src="/krasavitsa-logo.png" alt="Красавица" width={44} height={44} className="rounded-full bg-white" />
                <div>
                  <p className="text-xs font-bold uppercase text-white/55">AI-подбор</p>
                  <h2 className="text-3xl font-black leading-none text-white md:text-5xl">Beauty Search</h2>
                  <p className="mt-2 max-w-sm text-sm font-semibold leading-5 text-white/58">
                    Опишите задачу, бюджет и ограничения. Подбор появится справа.
                  </p>
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
          <div className="grid min-h-[390px] gap-2">
              <GlassPanel className="bg-white/54">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-black/45">AI-вывод</p>
                    <p className="mt-2 text-base font-semibold leading-7">{result.summary}</p>
                  </div>
                  <Bot className="size-8 shrink-0" />
                </div>
                <div className="grid gap-2">
                  <AnimatePresence mode="popLayout">
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
                  </AnimatePresence>
                </div>
              </GlassPanel>
          </div>
        </motion.div>
        </div>
      </section>

      <section id="telegram" className="grid gap-2 px-3 pb-2 pt-2 md:grid-cols-[1fr_0.9fr] md:px-5">
        <TelegramPortalPanel />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="liquid-glass relative overflow-hidden rounded-[var(--radius-xl)] bg-[url('/beauty-products-portal.png')] bg-cover bg-center bg-no-repeat p-2"
        >
          <div className="absolute inset-0 bg-white/58" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,.72),transparent_32%),linear-gradient(135deg,rgba(255,255,255,.56),rgba(255,255,255,.22))]" />
          <div className="relative z-10 flex min-h-[480px] flex-col justify-between rounded-[var(--radius-lg)] border border-white/55 bg-white/42 p-5 text-black shadow-[inset_0_0_0_1px_rgba(255,255,255,.16)] backdrop-blur-2xl md:p-6">
            <div>
              <p className="text-xs font-black uppercase text-black/45">Roadmap</p>
              <h3 className="mt-3 text-[clamp(2.5rem,4.7vw,4.4rem)] font-black leading-[0.9]">
                Что будет
                <br />
                дальше
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
                    setNotice(`${roadmap[selectedRoadmap].label}: ${roadmap[selectedRoadmap].title}`);
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
        <PortalPanel className="md:col-span-12" image="/beauty-products-portal.png">
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
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      className={cn(
        "fixed inset-0 z-[100] flex items-end justify-start bg-white p-6 transition-opacity duration-700 md:p-10",
        exiting && "opacity-0",
      )}
    >
      <motion.span
        initial={{ y: 18, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        className="text-7xl font-black leading-none tabular-nums md:text-9xl"
      >
        {count}
      </motion.span>
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
    ["Подбор ухода", "/care"],
    ["Парфюм", "/perfume"],
    ["Блог", "/blog"],
    ["Профиль", "/profile"],
  ];

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-white/54 px-4 py-2 backdrop-blur-2xl md:px-6 md:py-3">
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
        <button type="button" aria-label="Открыть меню" onClick={() => setOpen((value) => !value)} className="relative grid size-12 place-items-center rounded-full border border-white/20 bg-black text-white shadow-[0_14px_34px_rgba(0,0,0,.18)] md:hidden">
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </header>

      <div className={cn("fixed inset-0 z-[60] transition md:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
        <button type="button" aria-label="Закрыть меню" onClick={() => setOpen(false)} className={cn("absolute inset-0 bg-black/28 backdrop-blur-md transition duration-300", open ? "opacity-100" : "opacity-0")} />
        <aside className={cn("absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col justify-center gap-4 border-l border-white/20 bg-[rgba(30,26,24,.84)] px-8 text-white shadow-2xl backdrop-blur-2xl transition duration-500", open ? "translate-x-0" : "translate-x-full")}>
          <button type="button" aria-label="Закрыть меню" onClick={() => setOpen(false)} className="absolute right-5 top-5 grid size-12 place-items-center rounded-full border border-white/20 bg-white text-black">
            <X className="size-6" />
          </button>
          {links.map(([label, href], index) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${100 + index * 60}ms` : "0ms" }}
              className={cn("block text-4xl font-black text-white transition duration-500", open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0")}
            >
              {label}
            </a>
          ))}
          <button type="button" onClick={() => { setOpen(false); onTry(); }} className="mt-8 rounded-full bg-white px-6 py-4 text-sm font-bold text-black">
            Попробовать AI
          </button>
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
      layout
      initial={{ opacity: 0, y: 12, scale: 0.985, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, scale: 0.985, filter: "blur(8px)" }}
      whileHover={{ y: -3, scale: 1.006 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="apple-glass-card rounded-2xl border border-black/10 bg-white/62 p-4 backdrop-blur-2xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-black/45">{product.category}</p>
          <h3 className="mt-1 text-lg font-black">{product.name}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-black/55">{product.reason}</p>
        </div>
        <span title={product.ratingSource ?? "По оценкам пользователей Яндекс Маркет"} className="flex cursor-help items-center gap-1 rounded-full bg-black px-3 py-2 text-sm font-black text-white">
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
