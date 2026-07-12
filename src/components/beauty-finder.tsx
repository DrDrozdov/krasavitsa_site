"use client";

import { AnimatePresence, motion } from "motion/react";
import { Droplets, ExternalLink, Heart, Scissors, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

type Mode = "skin" | "hair" | "perfume";
type Product = { name: string; category: string; reason: string; rating: number; price?: string; image?: string; marketplaces?: Array<{ label: string; href: string }> };

const modeVisual: Record<Mode, string> = {
  skin: "/recommendations/skin-packshot-v1.png",
  hair: "/recommendations/hair-packshot-v1.png",
  perfume: "/recommendations/perfume-packshot-v1.png",
};

const modes: Array<{ id: Mode; label: string; description: string; Icon: typeof Sparkles }> = [
  { id: "skin", label: "Уход за кожей", description: "Тип кожи, барьер, активы и SPF", Icon: Droplets },
  { id: "hair", label: "Волосы", description: "Кожа головы, длина и укладка", Icon: Scissors },
  { id: "perfume", label: "Парфюм", description: "Ноты, настроение, повод и шлейф", Icon: Sparkles },
];

const examples: Record<Mode, string[]> = {
  skin: [
    "Собери базовый уход для комбинированной чувствительной кожи до 3500 ₽",
    "Нужен лёгкий крем и SPF без жирного блеска",
    "Как восстановить барьер после кислот без отдушек",
  ],
  hair: [
    "Подбери уход для жирной кожи головы и сухих окрашенных концов",
    "Нужны шампунь, кондиционер и термозащита до 4000 ₽",
    "Уход для пористых кудрявых волос без тяжёлых масел",
  ],
  perfume: [
    "Хочу чистый мускусный аромат для офиса без сладости",
    "Подбери тёплый вечерний парфюм с ванилью до 7000 ₽",
    "Нужна минеральная свежесть, чай и мягкий шлейф",
  ],
};

const exampleSets: Record<Mode, string[][]> = {
  skin: [examples.skin, [
    "Сыворотка для обезвоженной кожи без липкого финиша до 2500 ₽",
    "Мягкое очищение для реактивной кожи без отдушек",
    "Нужен городской SPF, который не скатывается под макияжем",
  ], [
    "Собери вечерний уход с ретиноидом для новичка",
    "Крем для жирной кожи с ослабленным барьером до 2000 ₽",
    "Как уменьшить сухость после кислот без десятка банок",
  ]],
  hair: [examples.hair, [
    "Шампунь для чувствительной кожи головы без сильной отдушки",
    "Нужен уход для тонких волос, чтобы не потерять объём",
    "Подбери несмываемый крем для осветлённой длины",
  ], [
    "Как собрать рутину для кудрявых пористых волос",
    "Термозащита и кондиционер для частой укладки до 3000 ₽",
    "Уход для жирных корней и ломких кончиков",
  ]],
  perfume: [examples.perfume, [
    "Хочу спокойный аромат с чаем и древесностью на каждый день",
    "Подбери подарок: чистый, универсальный, без сладкого шлейфа",
    "Нужен аромат для вечера с ирисом и мягким мускусом",
  ], [
    "Ищу прохладный цитрус без резкой бытовой свежести",
    "Подбери ванильный аромат без кондитерской тяжести",
    "Хочу лёгкий офисный парфюм до 6000 ₽",
  ]],
};

const placeholders: Record<Mode, string> = {
  skin: "Например: чувствительная кожа, сухость после умывания, бюджет 3000 ₽",
  hair: "Например: жирная кожа головы, окрашенная длина, нужна термозащита",
  perfume: "Например: чистый мускус, офис, без сладкого шлейфа, до 6000 ₽",
};

export function BeautyFinder() {
  const [mode, setMode] = useState<Mode>("skin");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [examplePage, setExamplePage] = useState(0);
  const active = useMemo(() => modes.find((item) => item.id === mode)!, [mode]);
  const activeExamples = exampleSets[mode][examplePage % exampleSets[mode].length];

  useEffect(() => {
    const timer = window.setInterval(() => setExamplePage((page) => (page + 1) % exampleSets[mode].length), 6400);
    return () => window.clearInterval(timer);
  }, [mode]);

  const changeMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setQuery("");
    setResults([]);
    setSummary("");
    setError("");
  };

  const search = async (value = query) => {
    const next = value.trim();
    setQuery(value);
    setError("");
    if (!next) return;
    setLoading(true);
    trackAnalyticsEvent("search_submit", `unified_${mode}`);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: next, mode }),
      });
      const data = (await response.json()) as { summary?: string; products?: Product[]; error?: string };
      if (!response.ok) {
        setResults([]);
        setSummary("");
        setError(data.error ?? "Не удалось обработать запрос.");
      } else {
        setSummary(data.summary ?? "Подборка готова.");
        const nextProducts = data.products ?? [];
        setResults(nextProducts);
        if (nextProducts.length) {
          void fetch("/api/profile/library", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "history", history: { query: next, mode, summary: data.summary, products: nextProducts } }),
          });
        }
        trackAnalyticsEvent("search_success", `unified_${mode}`);
      }
    } catch {
      setError("Связь с подбором прервалась. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (product: Product) => {
    const response = await fetch("/api/profile/library", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "favorite", product }),
    });
    const data = await response.json().catch(() => ({})) as { favorites?: Array<{ name: string }> };
    if (data.favorites) setSavedNames(data.favorites.map((item) => item.name));
  };

  return (
    <section className="px-3 pb-6 pt-4 md:px-5 md:pb-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-soft)]">Единый AI-подбор</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-[clamp(2.8rem,7vw,7rem)] font-black leading-[0.9] tracking-tight">Что вы хотите подобрать?</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-7 text-[var(--color-text-muted)]">Выберите направление. Правила, примеры и контекст AI изменятся вместе с ним.</p>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {modes.map(({ id, label, description, Icon }) => (
            <motion.button
              key={id}
              type="button"
              onClick={() => changeMode(id)}
              animate={mode === id ? { y: -4, scale: 1.015 } : { y: 0, scale: 1 }}
              whileHover={{ y: -4, scale: 1.012 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className={`direction-card rounded-[var(--radius-xl)] border p-5 text-left backdrop-blur-2xl ${mode === id ? "direction-card-active" : "border-[var(--color-border)] bg-[var(--color-glass)]"}`}
            >
              <Icon className="size-6" />
              <span className="mt-8 block text-2xl font-black">{label}</span>
              <span className="mt-2 block text-sm font-semibold text-[var(--color-text-muted)]">{description}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="brand-panel mt-5 overflow-hidden rounded-[var(--radius-xxl)] border border-white/25 p-4 shadow-[var(--shadow-soft)] backdrop-blur-3xl md:p-7"
          >
            <div className="flex items-center gap-3">
              <active.Icon className="size-6" />
              <div>
                <p className="text-xs font-black uppercase text-white/55">Сейчас подбираем</p>
                <h2 className="text-2xl font-black text-white">{active.label}</h2>
              </div>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
              <textarea
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholders[mode]}
                className="min-h-32 resize-none rounded-[var(--radius-lg)] border border-white/18 bg-white/10 p-5 text-base font-semibold leading-7 text-white outline-none backdrop-blur-2xl placeholder:text-white/42 focus:border-white/50"
              />
              <button type="button" onClick={() => void search()} disabled={loading} className="apple-glass-button min-h-14 rounded-[var(--radius-lg)] bg-white px-8 text-base font-black text-[var(--color-bordeaux)] disabled:opacity-60 md:min-h-full">
                {loading ? "Собираю…" : "Подобрать"}
              </button>
            </div>
            <div className="relative mt-4 min-h-[196px] md:min-h-[82px]">
              <AnimatePresence initial={false} mode="sync">
                <motion.div key={`${mode}-${examplePage}`} initial={{ opacity: 0, y: 26, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -26, filter: "blur(7px)" }} transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 grid gap-2 md:grid-cols-3">
                  {activeExamples.map((item) => (
                    <button key={item} type="button" onClick={() => { setQuery(item); void search(item); }} className="example-chip rounded-[var(--radius-md)] border border-white/14 bg-white/8 p-4 text-left text-sm font-bold leading-5 text-white/78 backdrop-blur-xl">
                      {item}
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            {error ? <p className="mt-5 rounded-[var(--radius-md)] bg-white/12 p-4 text-sm font-semibold text-white/80">{error}</p> : null}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {results.length ? (
            <motion.div key={`${mode}-${summary}`} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
              <p className="mx-auto max-w-3xl py-7 text-center text-xl font-bold leading-8 text-[var(--color-text-muted)]">{summary}</p>
              <div className="grid gap-3 md:grid-cols-2">
                {results.map((product) => (
                  <article key={product.name} className="meaning-card liquid-glass overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-glass)] p-3 backdrop-blur-2xl md:p-4">
                    <div className="relative mb-4 aspect-[16/7] overflow-hidden rounded-[calc(var(--radius-lg)-8px)] border border-white/30 bg-white/36">
                      <Image src={product.image || modeVisual[mode]} alt={`Визуал для рекомендации: ${product.name}`} fill sizes="(min-width: 768px) 48vw, 100vw" className="object-cover p-3" />
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div><p className="text-xs font-black uppercase text-[var(--color-text-soft)]">{product.category}</p><h3 className="mt-3 text-2xl font-black leading-tight">{product.name}</h3></div>
                      <span className="rating-badge shrink-0 rounded-full bg-[var(--color-bordeaux)] px-3 py-2 text-xs font-black text-white" tabIndex={0}>★ {product.rating.toFixed(1)}</span>
                    </div>
                    <p className="mt-4 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{product.reason}</p>
                    {product.price ? <p className="mt-3 text-sm font-black text-[var(--color-bordeaux)]">Ориентир по цене: {product.price}</p> : null}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {product.marketplaces?.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="apple-glass-button inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-white/48 px-3 py-2 text-xs font-black">{link.label}<ExternalLink className="size-3" /></a>)}
                      <button type="button" onClick={() => void toggleFavorite(product)} aria-label="Сохранить в избранное" className={`apple-glass-button grid size-9 place-items-center rounded-full border border-[var(--color-border)] bg-white/48 ${savedNames.includes(product.name) ? "text-[var(--color-bordeaux)]" : "text-[var(--color-text-muted)]"}`}><Heart className={`size-4 ${savedNames.includes(product.name) ? "fill-current" : ""}`} /></button>
                    </div>
                  </article>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
