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
  description: "Тестовый подбор парфюма по настроению, нотам и контексту в стиле Beauty OS.",
  alternates: { canonical: "/perfume" },
};

export default function PerfumePage() {
  const scentMap = [
    ["Чистота", "мускус, хлопок, белые цветы"],
    ["Уют", "ваниль, сандал, кашемир"],
    ["Свежесть", "чай, соль, зеленые ноты"],
    ["Вечер", "ирис, амбра, мягкие специи"],
  ];
  const occasions = [
    { title: "Дневной аромат", text: "Ненавязчивый шлейф, который не спорит с офисом, учебой и близкой дистанцией." },
    { title: "Свидание", text: "Теплое звучание: кремовые, пудровые или мягко-сладкие акценты без перегруза." },
    { title: "После душа", text: "Чистые мускусы, свежие цветы и ощущение ухоженности вместо громкой парфюмерии." },
    { title: "Вечерний образ", text: "Более плотная композиция с характером, но с учетом сезона и вашего стиля." },
  ];

  return (
    <BeautyPageShell>
      <PageHero
        eyebrow="Парфюм"
        title="Подбор парфюма по настроению, стилю и поводу"
        subtitle="Красавица помогает выбирать аромат через ощущение: чисто, мягко, заметно, уютно или прохладно. Без сухой витрины и случайных советов."
        cta="Следить за запуском"
        ctaHref="https://t.me/krasavitsa_ai"
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
                Мы учитываем повод, сезон, дистанцию, бюджет и то, какие ароматы уже нравятся или раздражают.
              </p>
            </div>
          </PortalPanel>
          <PortalPanel className="md:col-span-7">
            <div className="grid h-full gap-2 md:grid-cols-2">
              {scentMap.map(([title, text], index) => (
                <div key={title} className="apple-glass-card rounded-[var(--radius-md)] border border-white/55 bg-white/34 p-5 shadow-[var(--shadow-card)] backdrop-blur-2xl">
                  <p className="text-xs font-black text-[var(--color-text-soft)]">0{index + 1}</p>
                  <h3 className="mt-4 text-3xl font-black leading-none">{title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{text}</p>
                </div>
              ))}
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>
      <SectionIntro
        kicker="Сценарии"
        title="Аромат проще выбирать через контекст"
        text="Можно начать не с пирамиды нот, а с образа, повода, сезона и ощущения. Так подбор становится человеческим, а не техническим."
      />
      <SoftCards items={occasions} />
      <PerfumeFinder />
      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-12">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Скоро</p>
                <h2 className="mt-3 text-[clamp(2.2rem,3.8vw,4rem)] font-black leading-none">Парфюм станет отдельным модулем Beauty OS</h2>
              </div>
              <p className="max-w-xl text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
                Сейчас можно следить за запуском: в канале появятся тесты, примеры подборов и первые сценарии ароматного профиля.
              </p>
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>
      <TelegramCTA
        title="Подписаться на запуск парфюма"
        text="Мы сообщим в Telegram-канале, когда модуль ароматов появится в Красавице."
        href="https://t.me/krasavitsa_ai"
      />
    </BeautyPageShell>
  );
}
