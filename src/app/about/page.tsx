import type { Metadata } from "next";
import Image from "next/image";
import { BeautyPageShell, BeautyPortalGrid, PortalPanel, SectionIntro, SoftCards, TelegramCTA } from "@/components/portal-components";

export const metadata: Metadata = {
  title: "О проекте — Красавица",
  description: "Красавица — помощник, который упрощает выбор ухода и помогает покупать косметику осознаннее.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const nextSteps = [
    ["Профиль", "История подборов, избранное и параметры кожи в одном месте."],
    ["Рейтинг доверия", "Реакции пользователей помогут понимать, какие средства чаще подходят похожим запросам."],
    ["Парфюм", "Подбор ароматов по настроению, поводу и стилю, а не только по нотам."],
  ];

  return (
    <BeautyPageShell>
      <section className="px-3 pb-2 pt-5 md:px-5">
        <div className="liquid-glass relative min-h-[720px] overflow-hidden rounded-[var(--radius-xxl)] border border-[var(--color-border)] bg-white/48 p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl md:p-8">
          <div className="absolute inset-x-[18%] bottom-0 top-8 hidden md:block">
            <Image src="/beauty-products-portal.png" alt="" fill priority sizes="50vw" className="object-cover object-center opacity-90" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,247,243,.92),rgba(250,247,243,.18)_35%,rgba(250,247,243,.2)_65%,rgba(250,247,243,.94))]" />
          </div>
          <div className="relative z-10 grid min-h-[660px] gap-6 md:grid-cols-[0.95fr_0.8fr]">
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">О проекте</p>
                <h1 className="mt-8 max-w-3xl text-[clamp(3.2rem,7vw,7.2rem)] font-black leading-[0.9] tracking-tight">
                  Выбор ухода без шума
                </h1>
                <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-[var(--color-text-muted)]">
                  Красавица помогает превратить разрозненные советы, корзины и тренды в понятный план: задача, бюджет, объяснение и спокойный выбор.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Без давления", "По бюджету", "С объяснением"].map((item) => (
                  <div key={item} className="apple-glass-card rounded-full border border-black/10 bg-white/40 px-5 py-4 text-sm font-black backdrop-blur-2xl">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid content-between gap-4">
              <div className="apple-glass-card rounded-[var(--radius-xl)] border border-black/10 bg-white/48 p-6 text-right backdrop-blur-2xl">
                <p className="text-[clamp(2.7rem,6vw,6rem)] font-black leading-none">4</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">главные зоны: подбор, профиль, рейтинг доверия и парфюм</p>
              </div>
              <div className="apple-glass-card rounded-[var(--radius-xl)] border border-black/10 bg-[rgba(30,26,24,.82)] p-6 text-white backdrop-blur-2xl">
                <p className="text-[clamp(2.7rem,6vw,6rem)] font-black leading-none">0</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-white/68">давления на покупку: сначала смысл, потом средство</p>
              </div>
              <div className="apple-glass-card rounded-[var(--radius-xl)] border border-black/10 bg-white/48 p-6 backdrop-blur-2xl">
                <p className="text-[clamp(2.7rem,6vw,6rem)] font-black leading-none">1</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">личный сценарий вместо универсальных советов из ленты</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SectionIntro kicker="Миссия" title="Меньше шума, больше ясности" text="Красавица не продает технологию как самоцель. Она помогает человеку понять, что именно нужно его коже и почему." />
      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-7" image="/beauty-products-portal.png">
            <div className="flex min-h-[420px] flex-col justify-between">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Как появилась</p>
                <h2 className="mt-4 text-[clamp(2.35rem,4.2vw,4.7rem)] font-black leading-none">
                  Из усталости от случайных советов и бесконечных корзин
                </h2>
              </div>
              <p className="max-w-2xl text-base font-semibold leading-7 text-[var(--color-text-muted)]">
                Красавица собирает выбор вокруг реальной задачи: что беспокоит, какой бюджет, что уже есть дома и каких ошибок хочется избежать.
              </p>
            </div>
          </PortalPanel>
          <PortalPanel className="md:col-span-5">
            <div className="grid h-full gap-3">
              {["Сначала задача", "Потом бюджет", "Затем объяснение", "И только после — покупка"].map((item, index) => (
                <div key={item} className="rounded-[var(--radius-md)] border border-white/60 bg-white/42 p-5 text-xl font-black backdrop-blur-2xl">
                  <span className="mr-3 text-[var(--color-text-soft)]">0{index + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>
      <SoftCards
        items={[
          { title: "Понятные рекомендации", text: "Каждое средство объясняется простым языком: зачем оно нужно и какую роль играет в уходе." },
          { title: "Уважение к бюджету", text: "Подбор не должен превращаться в список случайных дорогих покупок." },
          { title: "Без давления", text: "Красавица помогает выбирать, а не навязывает средства и не обещает невозможного." },
          { title: "Контекст пользователя", text: "В будущем профиль сохранит историю подборов, реакции и параметры кожи." },
          { title: "Спокойный тон", text: "Мы избегаем тревожной косметической риторики и сложного технического языка." },
          { title: "Будущее портала", text: "Уход, профиль, рейтинг доверия и парфюм будут собираться в цельную beauty-среду." },
        ]}
      />
      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-4 md:row-span-3">
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Дальше</p>
            <h2 className="mt-4 text-[clamp(2.2rem,3.7vw,4rem)] font-black leading-none">Что будет развиваться</h2>
          </PortalPanel>
          {nextSteps.map(([title, text]) => (
            <PortalPanel key={title} className="md:col-span-8">
              <h3 className="text-2xl font-black">{title}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{text}</p>
            </PortalPanel>
          ))}
        </BeautyPortalGrid>
      </section>
      <TelegramCTA />
    </BeautyPageShell>
  );
}
