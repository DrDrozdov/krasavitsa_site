"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type Perfume = {
  name: string;
  mood: string;
  notes: string[];
  occasion: string;
  text: string;
};

const perfumes: Perfume[] = [
  {
    name: "Clean Reserve Skin",
    mood: "Чистота",
    notes: ["мускус", "соль", "кожа"],
    occasion: "каждый день",
    text: "Мягкий близкий аромат, который ощущается как чистая кожа после душа.",
  },
  {
    name: "Maison Margiela Lazy Sunday Morning",
    mood: "Свежесть",
    notes: ["мускус", "ирис", "ландыш"],
    occasion: "офис",
    text: "Светлый хлопковый профиль без громкого шлейфа.",
  },
  {
    name: "Byredo Blanche",
    mood: "Чистота",
    notes: ["альдегиды", "пион", "мускус"],
    occasion: "офис",
    text: "Холодная чистота и ощущение белой рубашки.",
  },
  {
    name: "Diptyque Eau Duelle",
    mood: "Уют",
    notes: ["ваниль", "кардамон", "чай"],
    occasion: "вечер",
    text: "Теплая ваниль без кондитерской тяжести.",
  },
  {
    name: "Jo Malone Wood Sage & Sea Salt",
    mood: "Свежесть",
    notes: ["соль", "шалфей", "древесность"],
    occasion: "каждый день",
    text: "Минеральная свежесть, которая не звучит как обычный цитрус.",
  },
  {
    name: "Narciso Rodriguez Pure Musc",
    mood: "Вечер",
    notes: ["мускус", "цветы", "кашемир"],
    occasion: "свидание",
    text: "Чистый, но более собранный и заметный мускус.",
  },
];

const noteFilters = ["Все", "мускус", "ваниль", "чай", "соль", "ирис", "древесность"];
const moodFilters = ["Любое", "Чистота", "Свежесть", "Уют", "Вечер"];

export function PerfumeFinder() {
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("Все");
  const [mood, setMood] = useState("Любое");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return perfumes.filter((perfume) => {
      const noteMatch = note === "Все" || perfume.notes.includes(note);
      const moodMatch = mood === "Любое" || perfume.mood === mood;
      const text = `${perfume.name} ${perfume.mood} ${perfume.occasion} ${perfume.notes.join(" ")} ${perfume.text}`.toLowerCase();
      const queryMatch = !normalized || text.includes(normalized);
      return noteMatch && moodMatch && queryMatch;
    });
  }, [mood, note, query]);

  return (
    <section className="px-3 py-2 md:px-5">
      <div className="liquid-glass grid gap-2 rounded-[var(--radius-xxl)] border border-[var(--color-border)] bg-white/34 p-2 shadow-[var(--shadow-soft)] backdrop-blur-2xl md:grid-cols-[0.85fr_1.15fr]">
        <div className="apple-glass-card rounded-[var(--radius-xl)] border border-black/10 bg-[rgba(30,26,24,.82)] p-5 text-white backdrop-blur-2xl md:p-6">
          <p className="text-sm font-black uppercase text-white/45">Парфюм-поиск</p>
          <h2 className="mt-4 text-[clamp(2.4rem,4.5vw,4.8rem)] font-black leading-none">Найдите звучание</h2>
          <p className="mt-5 max-w-xl text-sm font-semibold leading-6 text-white/66">
            Тестовый поиск: фильтры работают локально, без отправки данных. Можно искать по нотам, настроению и контексту.
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
        </div>
        <div className="rounded-[var(--radius-xl)] border border-white/60 bg-white/30 p-3 backdrop-blur-2xl">
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
                  className="apple-glass-card rounded-[var(--radius-lg)] border border-black/10 bg-white/46 p-5 backdrop-blur-2xl"
                >
                  <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">{perfume.mood} · {perfume.occasion}</p>
                  <h3 className="mt-3 text-2xl font-black leading-tight">{perfume.name}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{perfume.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {perfume.notes.map((item) => (
                      <span key={item} className="rounded-full border border-[var(--color-border)] bg-white/46 px-3 py-1.5 text-xs font-black text-[var(--color-text-muted)]">
                        {item}
                      </span>
                    ))}
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
