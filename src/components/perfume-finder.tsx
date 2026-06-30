"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

type Perfume = {
  name: string;
  mood: string;
  notes: string[];
  occasion: string;
  text: string;
  image: string;
};

const perfumes: Perfume[] = [
  {
    name: "Clean Reserve Skin",
    mood: "Чистота",
    notes: ["мускус", "соль", "кожа"],
    occasion: "каждый день",
    text: "Мягкий близкий аромат: чистая кожа после душа, без сладости и громкого шлейфа.",
    image: "/beauty-products-portal.png",
  },
  {
    name: "Maison Margiela Lazy Sunday Morning",
    mood: "Свежесть",
    notes: ["мускус", "ирис", "ландыш"],
    occasion: "офис",
    text: "Светлый хлопковый профиль для офиса и близкой дистанции.",
    image: "/beauty-portal-hero.png",
  },
  {
    name: "Byredo Blanche",
    mood: "Чистота",
    notes: ["альдегиды", "пион", "мускус"],
    occasion: "офис",
    text: "Холодная чистота, белая рубашка и очень собранное звучание.",
    image: "/beauty-products-portal.png",
  },
  {
    name: "Diptyque Eau Duelle",
    mood: "Уют",
    notes: ["ваниль", "кардамон", "чай"],
    occasion: "вечер",
    text: "Теплая ваниль без кондитерской тяжести, хорошо работает вечером.",
    image: "/beauty-products-portal.png",
  },
  {
    name: "Jo Malone Wood Sage & Sea Salt",
    mood: "Свежесть",
    notes: ["соль", "шалфей", "древесность"],
    occasion: "каждый день",
    text: "Минеральная свежесть без резкого цитруса и ощущения спортивного одеколона.",
    image: "/beauty-portal-hero.png",
  },
  {
    name: "Narciso Rodriguez Pure Musc",
    mood: "Вечер",
    notes: ["мускус", "цветы", "кашемир"],
    occasion: "свидание",
    text: "Чистый, но более заметный мускус: мягко, взросло, без перегруза.",
    image: "/beauty-products-portal.png",
  },
  {
    name: "Zara Ebony Wood",
    mood: "Уют",
    notes: ["древесность", "перец", "гвоздика"],
    occasion: "вечер",
    text: "Теплая древесная база для прохладной погоды и спокойного образа.",
    image: "/beauty-portal-hero.png",
  },
  {
    name: "L'Occitane Thé Vert",
    mood: "Свежесть",
    notes: ["чай", "цитрус", "зелень"],
    occasion: "каждый день",
    text: "Зеленый чай, чистый старт дня и легкая прозрачная свежесть.",
    image: "/beauty-products-portal.png",
  },
];

const noteFilters = ["Все", "мускус", "ваниль", "чай", "соль", "ирис", "древесность"];
const moodFilters = ["Любое", "Чистота", "Свежесть", "Уют", "Вечер"];

const promptPool = [
  "Хочу чистый аромат на каждый день без сладости",
  "Нужен теплый вечерний парфюм до 6000 ₽",
  "Подбери аромат похожий на кремовый мускус",
  "Ищу свежий офисный запах без резкого цитруса",
  "Хочу ваниль, но без кондитерской сладости",
  "Нужен аромат после душа, очень близкий к коже",
  "Подбери древесный парфюм на прохладный вечер",
  "Ищу чайный свежий аромат для работы",
  "Нужен чистый мускус для свидания",
  "Хочу соленую свежесть без морского одеколона",
  "Подбери пудровый аромат без тяжести",
  "Нужен мягкий офисный парфюм для близкой дистанции",
  "Хочу ирис и чистоту, без сладкого шлейфа",
  "Нужен уютный аромат на осень",
  "Ищу свежесть с зеленью и чаем",
  "Подбери спокойный аромат до 4000 ₽",
  "Хочу белую рубашку и чистую кожу",
  "Нужен вечерний аромат без громкости",
  "Ищу мускус, который не душит",
  "Подбери подарок: свежий и универсальный аромат",
  "Хочу древесность, но мягкую и женственную",
  "Нужен аромат для учебы без сильного шлейфа",
  "Ищу ваниль с кардамоном",
  "Подбери свежий парфюм для лета",
  "Хочу ощущение чистого крема и кожи",
  "Нужен аромат для офиса до 5000 ₽",
  "Ищу спокойный аромат на каждый день",
  "Подбери вечерний мускус с цветами",
];

export function PerfumeFinder() {
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("Все");
  const [mood, setMood] = useState("Любое");
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromptIndex((current) => (current + 4) % promptPool.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const visiblePrompts = useMemo(
    () => [0, 1, 2, 3].map((offset) => promptPool[(promptIndex + offset) % promptPool.length]),
    [promptIndex],
  );

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const words = normalized.split(/\s+/).filter((word) => word.length > 2);
    const filtered = perfumes.filter((perfume) => {
      const noteMatch = note === "Все" || perfume.notes.includes(note);
      const moodMatch = mood === "Любое" || perfume.mood === mood;
      const text = `${perfume.name} ${perfume.mood} ${perfume.occasion} ${perfume.notes.join(" ")} ${perfume.text}`.toLowerCase();
      const queryMatch = !words.length || words.some((word) => text.includes(word));
      return noteMatch && moodMatch && queryMatch;
    });

    if (filtered.length) return filtered;
    return perfumes.filter((perfume) => (note === "Все" || perfume.notes.includes(note)) && (mood === "Любое" || perfume.mood === mood)).slice(0, 4);
  }, [mood, note, query]);

  const applyPrompt = (prompt: string) => {
    const lower = prompt.toLowerCase();
    setQuery(prompt);
    const foundNote = noteFilters.find((item) => item !== "Все" && lower.includes(item));
    if (foundNote) setNote(foundNote);
    if (lower.includes("вечер")) setMood("Вечер");
    else if (lower.includes("уют") || lower.includes("тепл") || lower.includes("ванил")) setMood("Уют");
    else if (lower.includes("свеж") || lower.includes("офис") || lower.includes("чай")) setMood("Свежесть");
    else if (lower.includes("чист") || lower.includes("кож")) setMood("Чистота");
  };

  return (
    <section className="px-3 py-2 md:px-5">
      <div className="liquid-glass grid gap-2 rounded-[var(--radius-xxl)] border border-[var(--color-border)] bg-white/30 p-2 shadow-[var(--shadow-soft)] backdrop-blur-2xl md:grid-cols-[0.82fr_1.18fr]">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-black/10 bg-[linear-gradient(145deg,rgba(54,45,42,.9),rgba(94,78,72,.74))] p-5 text-white shadow-[var(--shadow-card)] backdrop-blur-2xl md:p-6">
          <div className="absolute inset-0 opacity-[0.18]">
            <Image src="/beauty-products-portal.png" alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-black uppercase text-white/50">Парфюм-поиск</p>
            <h2 className="mt-4 text-[clamp(2.35rem,4.3vw,4.7rem)] font-black leading-none">Найдите звучание</h2>
            <p className="mt-5 max-w-xl text-sm font-semibold leading-6 text-white/68">
              Тестовый поиск работает локально: фильтры, подсказки и выдача не отправляют данные наружу.
            </p>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Например: мускус, офис, ваниль"
              className="mt-6 h-14 w-full rounded-full border border-white/18 bg-white/12 px-5 text-base font-bold text-white outline-none backdrop-blur-xl placeholder:text-white/42 focus:border-white/55"
            />
            <div className="mt-5 grid gap-4">
              <FilterRow title="Нота" items={noteFilters} active={note} onChange={setNote} />
              <FilterRow title="Настроение" items={moodFilters} active={mood} onChange={setMood} />
            </div>
            <div className="mt-6">
              <p className="mb-3 text-xs font-black uppercase text-white/42">Живые примеры</p>
              <div className="grid gap-2">
                <AnimatePresence mode="popLayout">
                  {visiblePrompts.map((prompt) => (
                    <motion.button
                      key={prompt}
                      type="button"
                      onClick={() => applyPrompt(prompt)}
                      layout
                      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
                      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                      className="apple-glass-button rounded-full border border-white/14 bg-white/10 px-4 py-3 text-left text-sm font-black text-white/78 backdrop-blur-xl transition hover:bg-white hover:text-black"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-white/55 bg-white/30 p-3 backdrop-blur-2xl">
          <div className="mb-3 flex items-center justify-between gap-3 px-2">
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Варианты</p>
            <span className="rounded-full bg-black px-3 py-2 text-xs font-black text-white">{results.length}</span>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {results.map((perfume) => (
                <motion.article
                  key={perfume.name}
                  layout
                  initial={{ opacity: 0, y: 14, scale: 0.985, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, scale: 0.985, filter: "blur(8px)" }}
                  transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                  className="apple-glass-card overflow-hidden rounded-[var(--radius-lg)] border border-black/10 bg-white/42 backdrop-blur-2xl"
                >
                  <div className="relative h-36 overflow-hidden">
                    <Image src={perfume.image} alt="" fill sizes="(min-width: 768px) 24vw, 90vw" className="object-cover" />
                    <div className="absolute inset-0 bg-white/34" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">{perfume.mood} · {perfume.occasion}</p>
                    <h3 className="mt-3 text-2xl font-black leading-tight">{perfume.name}</h3>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{perfume.text}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {perfume.notes.map((item) => (
                        <span key={item} className="rounded-full border border-[var(--color-border)] bg-white/44 px-3 py-1.5 text-xs font-black text-[var(--color-text-muted)] backdrop-blur-xl">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterRow({ title, items, active, onChange }: { title: string; items: string[]; active: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase text-white/42">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`apple-glass-button rounded-full border px-3 py-2 text-xs font-black transition ${
              active === item
                ? "border-white bg-white text-black"
                : "border-white/14 bg-white/10 text-white/78 hover:bg-white hover:text-black"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
