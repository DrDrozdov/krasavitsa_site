"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Copy, Droplets, ExternalLink, Heart, Scissors, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

type Mode = "skin" | "hair" | "perfume";
type Product = {
  name: string;
  category: string;
  reason: string;
  matchScore: number;
  usage?: string;
  tradeoffs?: string[];
  image?: string;
  marketplaces?: Array<{ label: string; href: string; kind?: "official" | "retailer" }>;
};

const modeVisual: Record<Mode, string> = {
  skin: "/recommendations/skin-packshot-v2.webp",
  hair: "/recommendations/hair-packshot-v2.webp",
  perfume: "/recommendations/perfume-packshot-v2.webp",
};

const modes: Array<{ id: Mode; label: string; description: string; Icon: typeof Sparkles }> = [
  { id: "skin", label: "Кожа", description: "Тип кожи, барьер, активы и SPF", Icon: Droplets },
  { id: "hair", label: "Волосы", description: "Кожа головы, длина и укладка", Icon: Scissors },
  { id: "perfume", label: "Ароматы", description: "Ноты, настроение, повод и шлейф", Icon: Sparkles },
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

const searchFacts: Record<Mode, string[]> = {
  skin: [
    "Кожный барьер лучше восстанавливается от регулярности, чем от большого числа активов.",
    "SPF нужен не только летом: ультрафиолет проходит через облака и окна.",
    "Новый актив разумно вводить по одному — так легче заметить реакцию кожи.",
  ],
  hair: [
    "Длина волос не получает питание от кожи головы: ей важны кондиционирование и защита.",
    "Горячая укладка безопаснее, когда термозащиту наносят до нагрева, а не после.",
    "Один и тот же шампунь может работать по-разному из-за жёсткости воды.",
  ],
  perfume: [
    "Аромат раскрывается на коже иначе, чем на блоттере — дайте ему хотя бы 20 минут.",
    "Влажность и температура заметно меняют звучание и шлейф парфюма.",
    "Ноты в пирамиде — ориентир: композиция ощущается цельно, а не по отдельности.",
  ],
};

export function BeautyFinder() {
  const [mode, setMode] = useState<Mode>("skin");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchFactIndices, setSearchFactIndices] = useState([0, 1]);
  const [searchFactStep, setSearchFactStep] = useState(0);
  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [copiedName, setCopiedName] = useState("");
  const [examplePage, setExamplePage] = useState(0);
  const [placeholderPage, setPlaceholderPage] = useState(0);
  const reduceMotion = useReducedMotion();
  const active = useMemo(() => modes.find((item) => item.id === mode)!, [mode]);
  const activeExamples = exampleSets[mode][examplePage % exampleSets[mode].length];
  const activePlaceholder = [placeholders[mode], ...exampleSets[mode].flat()][placeholderPage % (exampleSets[mode].flat().length + 1)];

  useEffect(() => {
    const timer = window.setInterval(() => setExamplePage((page) => (page + 1) % exampleSets[mode].length), 6400);
    return () => window.clearInterval(timer);
  }, [mode]);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setSearchFactStep(1), 1800);
    return () => window.clearTimeout(timer);
  }, [loading, mode]);

  useEffect(() => {
    const timer = window.setInterval(() => setPlaceholderPage((page) => page + 1), 4200);
    return () => window.clearInterval(timer);
  }, [mode]);

  const changeMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setQuery("");
    setResults([]);
    setSummary("");
    setError("");
    setSearchFactStep(0);
    setPlaceholderPage(0);
  };

  const search = async (value = query) => {
    const next = value.trim();
    setQuery(value);
    setError("");
    if (!next) return;
    const startedAt = Date.now();
    setLoading(true);
    setResults([]);
    setSummary("");
    setSearchFactStep(0);
    const firstFact = Math.floor(Math.random() * searchFacts[mode].length);
    const secondFact = (firstFact + 1 + Math.floor(Math.random() * (searchFacts[mode].length - 1))) % searchFacts[mode].length;
    setSearchFactIndices([firstFact, secondFact]);
    trackAnalyticsEvent("search_submit", `unified_${mode}`, { mode });
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: next, mode }),
      });
      const data = (await response.json()) as {
        status?: "complete" | "needs_input" | "safety_redirect" | "no_verified_products";
        summary?: string;
        followUpQuestion?: string;
        products?: Product[];
        methodology?: string;
        error?: string;
      };
      if (!response.ok) {
        setResults([]);
        setSummary("");
        setError(data.error ?? "Не удалось обработать запрос.");
        trackAnalyticsEvent("search_rejected", `unified_${mode}`, { mode, durationMs: Date.now() - startedAt, result: "error" });
      } else {
        const explanation = [data.summary, data.followUpQuestion].filter(Boolean).join("\n\n");
        setSummary(explanation || "Подборка готова.");
        const nextProducts = data.products ?? [];
        setResults(nextProducts);
        if (nextProducts.length) {
          void fetch("/api/profile/library", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "history", history: { query: next, mode, summary: data.summary, products: nextProducts } }),
          });
          trackAnalyticsEvent("history_save", `unified_${mode}`, { mode, productCount: nextProducts.length });
        }
        trackAnalyticsEvent("search_success", `unified_${mode}`, { mode, durationMs: Date.now() - startedAt, productCount: nextProducts.length, source: data.methodology ?? "unknown", result: "success" });
      }
    } catch {
      setError("Связь с подбором прервалась. Попробуйте ещё раз.");
      trackAnalyticsEvent("form_error", `recommendations_${mode}`, { mode, durationMs: Date.now() - startedAt, result: "error" });
    } finally {
      const remainingAnimationTime = 1450 - (Date.now() - startedAt);
      if (remainingAnimationTime > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingAnimationTime));
      }
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
    if (data.favorites) {
      setSavedNames(data.favorites.map((item) => item.name));
      trackAnalyticsEvent("favorite_save", mode, { mode, result: "success" });
    }
  };

  const copyProductName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedName(name);
      trackAnalyticsEvent("copy_product_name", mode, { mode });
      window.setTimeout(() => setCopiedName((current) => current === name ? "" : current), 1800);
    } catch { /* Clipboard permission can be denied by the browser. */ }
  };

  return (
    <section className="ai-finder px-3 pb-6 pt-4 md:px-5 md:pb-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-text-soft)]">Единый AI-подбор</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-[clamp(2.8rem,7vw,7rem)] font-black leading-[0.9] tracking-tight">Что вы хотите подобрать?</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-7 text-[var(--color-text-muted)]">Выберите направление. Правила, примеры и контекст AI изменятся вместе с ним.</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 md:mt-10 md:gap-3">
          {modes.map(({ id, label, description, Icon }) => (
            <motion.button
              key={id}
              type="button"
              onClick={() => changeMode(id)}
              animate={mode === id ? { y: -4, scale: 1.015 } : { y: 0, scale: 1 }}
              whileHover={{ y: -4, scale: 1.012 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className={`direction-card min-h-[112px] rounded-[var(--radius-lg)] border p-3 text-left backdrop-blur-2xl md:min-h-0 md:rounded-[var(--radius-xl)] md:p-5 ${mode === id ? "direction-card-active" : "border-[var(--color-border)] bg-[var(--color-glass)]"}`}
            >
              <Icon className="size-5 md:size-6" />
              <span className="mt-5 block text-base font-black leading-tight md:mt-8 md:text-2xl">{label}</span>
              <span className="mt-2 hidden text-sm font-semibold text-[var(--color-text-muted)] md:block">{description}</span>
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
            className="brand-panel mt-4 overflow-hidden rounded-[var(--radius-xl)] border border-white/25 p-4 shadow-[var(--shadow-soft)] backdrop-blur-3xl md:mt-5 md:rounded-[var(--radius-xxl)] md:p-7"
          >
            <div className="flex items-center gap-3">
              <active.Icon className="size-6" />
              <div>
                <p className="text-xs font-black uppercase text-white/55">Сейчас подбираем</p>
                <h2 className="text-2xl font-black text-white">{active.label}</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:mt-8 md:grid-cols-[1fr_auto]">
              <div className="relative min-h-28 md:min-h-32">
                <textarea
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder=""
                  aria-label="Опишите задачу для подбора"
                  className="relative z-10 min-h-28 w-full resize-none rounded-[var(--radius-lg)] border border-white/18 bg-white/10 p-4 text-sm font-semibold leading-6 text-white outline-none backdrop-blur-2xl focus:border-white/50 md:min-h-32 md:p-5 md:text-base md:leading-7"
                />
                {!query ? <AnimatePresence mode="wait" initial={false}><motion.span key={`${mode}-${placeholderPage}`} initial={{ opacity: 0, y: 12, filter: "blur(5px)" }} animate={{ opacity: 0.52, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -9, filter: "blur(5px)" }} transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }} className="pointer-events-none absolute left-5 right-5 top-5 z-20 text-base font-semibold leading-7 text-white/70">{activePlaceholder}</motion.span></AnimatePresence> : null}
              </div>
              <button type="button" onClick={() => void search()} disabled={loading} className="apple-glass-button min-h-14 rounded-[var(--radius-lg)] bg-white px-8 text-base font-black text-[var(--color-bordeaux)] disabled:opacity-60 md:min-h-full">
                {loading ? "Собираю…" : "Подобрать"}
              </button>
            </div>
            <div className="mt-3 md:mt-4">
              <AnimatePresence initial={false} mode="wait">
                <motion.div key={`${mode}-${examplePage}`} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -26, filter: "blur(7px)" }} transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }} className="flex items-stretch gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible">
                  {activeExamples.map((item) => (
                    <button key={item} type="button" onClick={() => { setQuery(item); void search(item); }} className="example-chip min-h-[5.75rem] w-[88%] shrink-0 whitespace-normal rounded-[var(--radius-md)] border border-white/14 bg-white/8 p-3 text-left text-xs font-bold leading-5 text-white/78 backdrop-blur-xl md:min-h-[6.5rem] md:w-auto md:p-4 md:text-sm md:leading-6">
                      {item}
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            {error ? <p className="mt-5 rounded-[var(--radius-md)] bg-white/12 p-4 text-sm font-semibold text-white/80">{error}</p> : null}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.div
              key={`searching-${mode}`}
              initial={{ opacity: 0, transform: "translateY(16px) scale(0.98)", filter: "blur(5px)" }}
              animate={{ opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)" }}
              exit={{ opacity: 0, transform: "translateY(-10px) scale(0.99)", filter: "blur(3px)" }}
              transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
              aria-live="polite"
              className="search-discovery mt-5 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-glass)] p-5 text-center shadow-[var(--shadow-soft)] backdrop-blur-2xl md:mt-7 md:rounded-[var(--radius-xxl)] md:p-8"
            >
              <div className="search-prism-stage" aria-hidden="true">
                <span className="search-prism-halo" />
                <span className="search-prism-orbit" />
                <span className="search-prism">
                  <i className="search-prism-face" />
                  <i className="search-prism-face" />
                  <i className="search-prism-face" />
                  <Sparkles className="search-prism-core" strokeWidth={1.8} />
                </span>
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-text-soft)]">Подбор уже в процессе</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">Сверяю детали вашего запроса</h2>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`${mode}-${searchFactIndices[searchFactStep]}`}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(26px)", filter: "blur(8px)" }}
                  animate={{ opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(-26px)", filter: "blur(7px)" }}
                  transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-6 text-[var(--color-text-muted)] md:text-base"
                >
                  <span className="mr-2 font-black text-[var(--color-bordeaux)]">Beauty-факт</span>
                  {searchFacts[mode][searchFactIndices[searchFactStep]]}
                </motion.p>
              </AnimatePresence>
              <div className="mx-auto mt-6 h-1 w-full max-w-md overflow-hidden rounded-full bg-[var(--color-border)]">
                <span className="search-discovery-progress block h-full w-2/5 rounded-full bg-[var(--color-bordeaux)]" />
              </div>
            </motion.div>
          ) : results.length ? (
            <motion.div key={`${mode}-${summary}`} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
              <p className="mx-auto max-w-3xl whitespace-pre-line py-7 text-center text-xl font-bold leading-8 text-[var(--color-text-muted)]">{summary}</p>
              <div className="grid gap-3 md:grid-cols-2">
                {results.map((product, index) => (
                  <motion.article key={product.name} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .58, delay: index * .07, ease: [0.16, 1, 0.3, 1] }} className="product-result-card overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
                    <div className="product-result-visual relative aspect-[16/9] overflow-hidden bg-[var(--color-soft)]">
                      {/* The browser requests all product compositions in parallel; the endpoint validates the official image and always has a local fallback. */}
                      <Image src={product.image || modeVisual[mode]} alt={`Визуал для рекомендации: ${product.name}`} fill unoptimized priority={index < 2} sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" onError={(event) => { if (!event.currentTarget.dataset.fallback) { event.currentTarget.dataset.fallback = "true"; event.currentTarget.src = modeVisual[mode]; } }} />
                    </div>
                    <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0"><p className="text-xs font-black text-[var(--color-bordeaux)]">{product.category}</p><div className="mt-2 flex items-start gap-2"><h3 className="text-[clamp(1.35rem,3vw,2rem)] font-black leading-[1.05] tracking-[-.035em]">{product.name}</h3><button type="button" onClick={() => void copyProductName(product.name)} aria-label={`Скопировать название ${product.name}`} className="apple-glass-button mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-soft)] text-[var(--color-bordeaux)]">{copiedName === product.name ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}</button></div></div>
                      <span className="rating-badge shrink-0 rounded-full bg-[var(--color-bordeaux)] px-3 py-2 text-xs font-black text-white" tabIndex={0} title="Степень соответствия именно вашему запросу, а не пользовательский рейтинг">{Math.round(product.matchScore)}% совпадение</span>
                    </div>
                    <p className="mt-4 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{product.reason}</p>
                    {product.usage ? <p className="mt-3 text-sm font-semibold leading-6"><span className="font-black text-[var(--color-bordeaux)]">Как использовать:</span> {product.usage}</p> : null}
                    {product.tradeoffs?.length ? <p className="mt-3 text-xs font-semibold leading-5 text-[var(--color-text-soft)]">Важно: {product.tradeoffs.join(" · ")}</p> : null}
                    <div className="mt-4 flex items-center justify-between gap-3 border-y border-[var(--color-border)] py-3 text-xs font-bold text-[var(--color-text-muted)]"><span>Рейтинг сообщества</span><span>Новый · оценок пока нет</span></div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {product.marketplaces?.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="apple-glass-button inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-white/48 px-3 py-2 text-xs font-black">{link.label}<ExternalLink className="size-3" /></a>)}
                      <button type="button" onClick={() => void toggleFavorite(product)} aria-label="Сохранить в избранное" className={`apple-glass-button grid size-9 place-items-center rounded-full border border-[var(--color-border)] bg-white/48 ${savedNames.includes(product.name) ? "text-[var(--color-bordeaux)]" : "text-[var(--color-text-muted)]"}`}><Heart className={`size-4 ${savedNames.includes(product.name) ? "fill-current" : ""}`} /></button>
                    </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          ) : summary ? (
            <motion.div key={`${mode}-${summary}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto mt-5 max-w-3xl rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-glass)] p-6 text-center shadow-[var(--shadow-soft)] backdrop-blur-2xl md:p-9">
              <p className="whitespace-pre-line text-lg font-bold leading-8 text-[var(--color-text-muted)]">{summary}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
