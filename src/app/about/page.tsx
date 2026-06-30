import type { Metadata } from "next";
import { BeautyPageShell, BeautyPortalGrid, PortalPanel, SectionIntro, SoftCards, TelegramCTA } from "@/components/portal-components";

export const metadata: Metadata = {
  title: "О проекте — Красавица",
  description: "Красавица — проект для осознанного выбора ухода, профиля кожи, рейтинга доверия и будущего парфюм-модуля.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const principles = [
    { title: "Сначала задача", text: "Подбор начинается не с витрины, а с вопроса: что беспокоит, какой бюджет и какие ограничения есть." },
    { title: "Понятная причина", text: "У каждого средства должна быть роль: очищение, барьер, SPF, актив или поддержка." },
    { title: "Без давления", text: "Мы не подталкиваем к лишним покупкам и не обещаем невозможного результата." },
    { title: "Профиль вместо хаоса", text: "История подборов, избранное и реакции постепенно собираются в личный контекст." },
  ];

  return (
    <BeautyPageShell>
      <section className="px-3 pb-2 pt-5 md:px-5">
        <div className="liquid-glass relative overflow-hidden rounded-[var(--radius-xxl)] border border-[var(--color-border)] bg-[rgba(255,255,255,.34)] p-3 shadow-[var(--shadow-soft)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[url('/beauty-bg-03.svg')] bg-cover bg-center opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,.82),rgba(255,255,255,.22)_48%,rgba(20,17,15,.62))] dark:bg-[linear-gradient(105deg,rgba(20,17,15,.84),rgba(20,17,15,.38)_48%,rgba(20,17,15,.82))]" />
          <div className="relative z-10 grid min-h-[680px] gap-3 md:grid-cols-12">
            <div className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-white/60 bg-white/34 p-6 text-[var(--color-text)] backdrop-blur-2xl md:col-span-7 md:p-8">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">О проекте</p>
                <h1 className="mt-6 max-w-4xl text-[clamp(3.2rem,7vw,7rem)] font-black leading-[0.9] tracking-tight">
                  Красота без лишнего шума
                </h1>
                <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[var(--color-text-muted)]">
                  В апреле 2024 года мы начали собирать Красавицу как спокойный портал для выбора ухода: без давления, без случайной корзины и без тревожной beauty-риторики.
                </p>
              </div>
              <div className="mt-8 grid gap-2 sm:grid-cols-3">
                {["Апрель 2024", "4 зоны развития", "0 давления"].map((item) => (
                  <div key={item} className="rounded-full border border-black/10 bg-white/46 px-5 py-4 text-sm font-black backdrop-blur-2xl">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:col-span-5">
              {[
                ["2024", "запуск концепции"],
                ["4", "направления: уход, профиль, рейтинг и парфюм"],
                ["1", "личный сценарий вместо универсального совета"],
              ].map(([number, text]) => (
                <div key={number} className="apple-glass-card rounded-[var(--radius-xl)] border border-white/55 bg-[rgba(255,255,255,.42)] p-6 text-[var(--color-text)] backdrop-blur-2xl">
                  <p className="text-[clamp(3rem,6vw,6.5rem)] font-black leading-none">{number}</p>
                  <p className="mt-3 text-base font-black leading-6 text-[var(--color-text-muted)]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <SectionIntro
        kicker="Идея"
        title="Мы строим не магазин, а понятный маршрут выбора"
        text="Красавица должна помогать человеку понять свою задачу, бюджет и ограничения, а уже потом выбирать средство или аромат."
      />
      <SoftCards items={principles} />
      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-5" image="/beauty-bg-02.svg">
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Участие</p>
            <h2 className="mt-4 text-[clamp(2.25rem,4vw,4.3rem)] font-black leading-none">Проект готовится к публичным отборам и партнерским пилотам</h2>
            <p className="mt-5 text-base font-semibold leading-7 text-[var(--color-text-muted)]">
              Мы развиваем продукт как независимый digital-сервис: с аккуратной редакцией, прозрачными документами и понятным пользовательским сценарием.
            </p>
          </PortalPanel>
          <PortalPanel className="md:col-span-7">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Редакция", "Подробные статьи вместо коротких лозунгов."],
                ["Сообщество", "Будущие оценки средств и реакции пользователей."],
                ["Профиль", "Личный контекст кожи, бюджета и ограничений."],
                ["Парфюм", "Подбор аромата по настроению, нотам и ситуации."],
              ].map(([title, text]) => (
                <div key={title} className="apple-glass-card rounded-[var(--radius-md)] border border-white/60 bg-white/34 p-5 backdrop-blur-2xl">
                  <h3 className="text-2xl font-black">{title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{text}</p>
                </div>
              ))}
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>
      <TelegramCTA title="Следить за развитием" text="В Telegram-канале будут новости о запуске профиля, рейтинга доверия и парфюм-модуля." href="https://t.me/krasavitsa_ai" />
    </BeautyPageShell>
  );
}
