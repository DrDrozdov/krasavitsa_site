import type { Metadata } from "next";
import {
  BeautyPageShell,
  BeautyPortalGrid,
  PageHero,
  PortalPanel,
  SectionIntro,
  SoftCards,
  TelegramCTA,
} from "@/components/portal-components";
import { PerfumeFinder } from "@/components/perfume-finder";

export const metadata: Metadata = {
  title: "Подбор парфюма — Красавица",
  description: "Будущий подбор парфюма под настроение, стиль и повод в мягкой beauty-логике Красавицы.",
  alternates: { canonical: "/perfume" },
};

export default function PerfumePage() {
  const scentMap = [
    ["Чистота", "мускус, хлопок, белые цветы"],
    ["Уют", "ваниль, сандал, кашемир"],
    ["Свежесть", "цитрус, чай, зеленые ноты"],
    ["Вечер", "амбера, ирис, мягкие специи"],
  ];
  const occasions = [
    { title: "Дневной аромат", text: "Ненавязчивый шлейф, который не спорит с офисом, учебой и близкой дистанцией." },
    { title: "Свидание", text: "Более теплое звучание: кремовые, пудровые или сладкие акценты без перегруза." },
    { title: "После душа", text: "Чистые мускусы, свежие цветы и ощущение ухоженности вместо громкой парфюмерии." },
    { title: "Вечерний образ", text: "Более плотная композиция с характером, но с учетом сезона и вашего стиля." },
  ];
  const prompts = [
    "Хочу чистый аромат на каждый день без сладости",
    "Нужен теплый вечерний парфюм до 6000 ₽",
    "Подбери аромат похожий на кремовый мускус",
    "Ищу свежий офисный запах без резкого цитруса",
  ];

  return (
    <BeautyPageShell>
      <PageHero
        eyebrow="Парфюм"
        title="Подбор парфюма под настроение, стиль и повод"
        subtitle="Скоро Красавица сможет помогать с ароматами: от повседневного чистого запаха до вечернего парфюма с характером."
        cta="Узнать, когда появится"
        image="/beauty-products-portal.png"
        tiles={["Чистота", "Тепло", "Свежесть", "Шлейф"]}
      />
      <section className="px-3 pb-2 pt-2 md:px-5">
        <BeautyPortalGrid className="min-h-[520px]">
          <PortalPanel className="md:col-span-5" image="/beauty-products-portal.png">
            <div className="flex min-h-[440px] flex-col justify-between">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Ароматный профиль</p>
                <h2 className="mt-4 max-w-xl text-[clamp(2.45rem,4.4vw,4.8rem)] font-black leading-[0.95] tracking-tight">
                  Не ноты ради нот, а ощущение, которое хочется носить
                </h2>
              </div>
              <p className="max-w-lg text-base font-semibold leading-7 text-[var(--color-text-muted)]">
                Красавица будет учитывать повод, сезон, дистанцию, бюджет и то, какие ароматы вам уже нравятся или раздражают.
              </p>
            </div>
          </PortalPanel>
          <PortalPanel className="md:col-span-7">
            <div className="grid h-full gap-2 md:grid-cols-2">
              {scentMap.map(([title, text], index) => (
                <div key={title} className="apple-glass-card rounded-[var(--radius-md)] border border-white/55 bg-white/36 p-5 shadow-[var(--shadow-card)] backdrop-blur-2xl">
                  <p className="text-xs font-black text-[var(--color-text-soft)]">0{index + 1}</p>
                  <h3 className="mt-4 text-3xl font-black leading-none">{title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{text}</p>
                </div>
              ))}
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>
      <SectionIntro kicker="Сценарии" title="Аромат проще выбирать через контекст" text="Не обязательно начинать с пирамиды нот. Можно начать с образа, повода, сезона и ощущения: чисто, мягко, заметно, уютно или прохладно." />
      <SoftCards
        items={occasions}
      />
      <PerfumeFinder />
      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-5">
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Примеры запросов</p>
            <h2 className="mt-4 text-[clamp(2.25rem,4vw,4.4rem)] font-black leading-none">Можно писать человеческим языком</h2>
            <p className="mt-5 text-base font-semibold leading-7 text-[var(--color-text-muted)]">
              Будущий модуль будет понимать не только семейства ароматов, но и ситуации: близкая дистанция, офис, вечер, подарок или настроение.
            </p>
          </PortalPanel>
          <PortalPanel className="md:col-span-7">
            <div className="grid gap-3">
              {prompts.map((prompt) => (
                <div key={prompt} className="apple-glass-card rounded-full border border-white/60 bg-white/42 px-5 py-4 text-base font-black backdrop-blur-2xl">
                  {prompt}
                </div>
              ))}
            </div>
          </PortalPanel>
          <PortalPanel className="md:col-span-12">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Скоро</p>
                <h2 className="mt-3 text-[clamp(2.2rem,3.8vw,4rem)] font-black leading-none">Парфюм появится как отдельный модуль Красавицы</h2>
              </div>
              <p className="max-w-xl text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
                Сейчас можно подписаться на запуск: мы не будем собирать лишние данные, только сообщим, когда подбор ароматов станет доступен.
              </p>
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>
      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-12">
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Как будет работать</p>
            <h2 className="mt-4 max-w-4xl text-[clamp(2.15rem,3.6vw,3.8rem)] font-black leading-none">Мини-диалог вместо случайной витрины</h2>
          </PortalPanel>
          {[
            ["1", "Опишите задачу", "Например: чистый аромат на каждый день, без сладости, до 5000 ₽."],
            ["2", "Уточните привычки", "Что уже нравится: мускусы, цитрус, пудра, чай, ваниль или древесность."],
            ["3", "Получите подбор", "Карточки ароматов с причиной выбора, похожими направлениями и ссылками."],
          ].map(([number, title, text]) => (
            <PortalPanel key={number} className="md:col-span-4">
              <div className="flex h-full items-start gap-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-black text-xl font-black text-white">{number}</span>
                <div>
                  <h3 className="text-2xl font-black">{title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{text}</p>
                </div>
              </div>
            </PortalPanel>
          ))}
        </BeautyPortalGrid>
      </section>
      <TelegramCTA title="Подписаться на запуск парфюма" text="Мы сообщим в Telegram, когда модуль ароматов появится в Красавице." />
    </BeautyPageShell>
  );
}
