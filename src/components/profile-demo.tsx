"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { BeautyPortalGrid, PortalPanel } from "@/components/portal-components";

const profileFields = [
  { label: "Тип кожи", value: "Комбинированная, склонна к обезвоженности" },
  { label: "Главные задачи", value: "Блеск в T-зоне, сухость после умывания, SPF без липкости" },
  { label: "Бюджет", value: "до 3 500 ₽ за базовый набор" },
  { label: "Ограничения", value: "без сильных отдушек, осторожно с кислотами" },
];

const history = [
  ["Сегодня", "Базовый уход: очищение, крем, SPF"],
  ["Неделя назад", "Восстановление барьера после активов"],
  ["Сохранено", "Легкий крем и мягкое очищение"],
];

export function ProfileDemo() {
  const [mode, setMode] = useState<"form" | "history" | "article">("form");

  return (
    <div className="px-3 py-2 md:px-5">
      <BeautyPortalGrid className="min-h-[640px]">
        <PortalPanel className="md:col-span-5" image="/beauty-products-portal.png">
          <div className="flex min-h-[420px] flex-col justify-between md:min-h-[560px]">
            <div>
              <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Демо-профиль</p>
              <h2 className="mt-4 text-[clamp(2.35rem,4.6vw,5rem)] font-black leading-none">
                Личная карта ухода, истории и материалов
              </h2>
              <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-[var(--color-text-muted)]">
                Это визуальный прототип. Поля пока не отправляют данные, но показывают будущую механику профиля Beauty OS.
              </p>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <ProfileTab active={mode === "form"} onClick={() => setMode("form")}>Анкета</ProfileTab>
              <ProfileTab active={mode === "history"} onClick={() => setMode("history")}>История</ProfileTab>
              <ProfileTab active={mode === "article"} onClick={() => setMode("article")}>Статья</ProfileTab>
            </div>
          </div>
        </PortalPanel>
        <PortalPanel className="md:col-span-7">
          <AnimatePresence mode="wait">
            {mode === "form" ? <ProfileForm key="form" /> : null}
            {mode === "history" ? <ProfileHistory key="history" /> : null}
            {mode === "article" ? <ArticleDraft key="article" /> : null}
          </AnimatePresence>
        </PortalPanel>
      </BeautyPortalGrid>
    </div>
  );
}

function ProfileTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`apple-glass-button rounded-full px-5 py-4 text-sm font-black ${
        active ? "bg-black text-white" : "border border-black/10 bg-white/38 text-[var(--color-text)]"
      }`}
    >
      {children}
    </button>
  );
}

function ProfileForm() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      className="grid h-full gap-3"
    >
      <div>
        <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Анкета</p>
        <h3 className="mt-3 text-3xl font-black leading-none md:text-4xl">Параметры кожи</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {profileFields.map((field) => (
          <label key={field.label} className="apple-glass-card rounded-[var(--radius-md)] border border-white/60 bg-white/34 p-4 backdrop-blur-2xl">
            <span className="text-xs font-black uppercase text-[var(--color-text-soft)]">{field.label}</span>
            <textarea readOnly value={field.value} aria-label={field.label} className="mt-3 min-h-24 w-full resize-none bg-transparent text-base font-bold leading-6 text-[var(--color-text)] outline-none" />
          </label>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ["Имя", "Мария"],
          ["Email", "demo@krasavitsa.ai"],
        ].map(([label, value]) => (
          <label key={label} className="apple-glass-card rounded-[var(--radius-md)] border border-white/60 bg-white/34 p-4 backdrop-blur-2xl">
            <span className="text-xs font-black uppercase text-[var(--color-text-soft)]">{label}</span>
            <input readOnly value={value} className="mt-3 w-full bg-transparent text-lg font-black outline-none" aria-label={label} />
          </label>
        ))}
      </div>
      <div className="grid gap-2 rounded-[var(--radius-md)] border border-white/60 bg-white/28 p-4 backdrop-blur-2xl">
        {[
          "Согласие на обработку данных для работы профиля",
          "Согласие получать сервисные уведомления в Telegram",
          "Я понимаю, что форма сейчас демонстрационная",
        ].map((item) => (
          <label key={item} className="flex items-center gap-3 text-sm font-bold text-[var(--color-text-muted)]">
            <input type="checkbox" readOnly checked className="size-5 accent-black" />
            {item}
          </label>
        ))}
      </div>
      <button type="button" className="apple-glass-button rounded-full bg-black px-6 py-4 text-sm font-black text-white">
        Создать тестовый профиль
      </button>
    </motion.div>
  );
}

function ProfileHistory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      className="grid gap-2"
    >
      {history.map(([date, title]) => (
        <div key={title} className="apple-glass-card flex flex-col gap-3 rounded-[var(--radius-md)] border border-white/60 bg-white/34 p-4 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">{date}</p>
            <p className="mt-1 text-xl font-black">{title}</p>
          </div>
          <span className="w-fit rounded-full bg-black px-4 py-2 text-xs font-black uppercase text-white">Preview</span>
        </div>
      ))}
    </motion.div>
  );
}

function ArticleDraft() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      className="grid gap-3"
    >
      <div>
        <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Пользовательская статья</p>
        <h3 className="mt-3 text-3xl font-black leading-none md:text-4xl">Черновик для блога</h3>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
          Форма пока нерабочая, но показывает будущий формат авторских материалов: имя, заголовок, текст, оценки и комментарии.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-[0.7fr_1.3fr]">
        <label className="apple-glass-card rounded-[var(--radius-md)] border border-white/60 bg-white/34 p-4 backdrop-blur-2xl">
          <span className="text-xs font-black uppercase text-[var(--color-text-soft)]">Автор</span>
          <input readOnly value="Анна, 29" className="mt-3 w-full bg-transparent text-2xl font-black outline-none" aria-label="Автор статьи" />
        </label>
        <label className="apple-glass-card rounded-[var(--radius-md)] border border-white/60 bg-white/34 p-4 backdrop-blur-2xl">
          <span className="text-xs font-black uppercase text-[var(--color-text-soft)]">Заголовок</span>
          <input readOnly value="Как я собрала спокойный уход без лишних банок" className="mt-3 w-full bg-transparent text-2xl font-black leading-tight outline-none" aria-label="Заголовок статьи" />
        </label>
      </div>
      <label className="apple-glass-card rounded-[var(--radius-lg)] border border-white/60 bg-white/34 p-5 backdrop-blur-2xl">
        <span className="text-xs font-black uppercase text-[var(--color-text-soft)]">Материал</span>
        <textarea
          readOnly
          value="У меня комбинированная кожа, но раньше я покупала средства по трендам. В Красавице я описала бюджет, реакцию на кислоты и желание убрать липкость. Подбор получился коротким: мягкое очищение, крем для барьера и SPF без блеска."
          className="mt-4 min-h-40 w-full resize-none bg-transparent text-base font-semibold leading-7 text-[var(--color-text-muted)] outline-none"
          aria-label="Текст статьи"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        {["Оценить", "Сохранить", "Комментировать"].map((item) => (
          <button key={item} type="button" className="apple-glass-button rounded-full border border-black/10 bg-white/38 px-5 py-4 text-sm font-black text-[var(--color-text)] backdrop-blur-2xl hover:bg-black hover:text-white">
            {item}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
