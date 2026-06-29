import type { Metadata } from "next";
import { BeautyPageShell, BeautyPortalGrid, PageHero, PortalPanel, SectionIntro, SoftCards, TelegramCTA } from "@/components/portal-components";

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
      <PageHero
        eyebrow="О проекте"
        title="Красавица — помощник, который упрощает выбор ухода"
        subtitle="Мы хотим, чтобы подбор косметики перестал быть бесконечным поиском, случайными покупками и противоречивыми советами."
        cta="Попробовать Красавицу"
        tiles={["Понятно", "Без давления", "По бюджету", "С объяснением"]}
      />
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
