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
  const [mode, setMode] = useState<"form" | "history">("form");

  return (
    <>
      <div className="px-3 py-2 md:px-5">
        <BeautyPortalGrid className="min-h-[640px]">
          <PortalPanel className="md:col-span-5" image="/beauty-products-portal.png">
            <div className="flex min-h-[420px] flex-col justify-between md:min-h-[560px]">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Демо-профиль</p>
                <h2 className="mt-4 text-[clamp(2.35rem,4.6vw,5rem)] font-black leading-none">
                  Личная карта ухода без регистрации
                </h2>
                <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-[var(--color-text-muted)]">
                  Это визуальный прототип. Поля не отправляются и не сохраняются: форма показывает будущую механику профиля.
                </p>
              </div>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode("form")}
                  className={`apple-glass-button rounded-full px-5 py-4 text-sm font-black ${mode === "form" ? "bg-black text-white" : "border border-black/10 bg-white/42 text-[var(--color-text)]"}`}
                >
                  Анкета
                </button>
                <button
                  type="button"
                  onClick={() => setMode("history")}
                  className={`apple-glass-button rounded-full px-5 py-4 text-sm font-black ${mode === "history" ? "bg-black text-white" : "border border-black/10 bg-white/42 text-[var(--color-text)]"}`}
                >
                  История
                </button>
              </div>
            </div>
          </PortalPanel>
          <PortalPanel className="md:col-span-7">
            <AnimatePresence mode="wait">
              {mode === "form" ? (
                <motion.div
                  key="form"
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
                        <textarea
                          readOnly
                          value={field.value}
                          aria-label={field.label}
                          className="mt-3 min-h-24 w-full resize-none bg-transparent text-base font-bold leading-6 text-[var(--color-text)] outline-none"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white/30 p-4 backdrop-blur-2xl">
                    <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Избранное</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["SPF без блеска", "Крем для барьера", "Мягкое очищение", "Сыворотка без липкости"].map((item) => (
                        <span key={item} className="rounded-full border border-[var(--color-border)] bg-white/42 px-4 py-2 text-sm font-black text-[var(--color-text-muted)]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button type="button" className="apple-glass-button rounded-full bg-black px-6 py-4 text-sm font-black text-white">
                    Тестовая кнопка профиля
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="history"
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
              )}
            </AnimatePresence>
          </PortalPanel>
        </BeautyPortalGrid>
      </div>
    </>
  );
}
