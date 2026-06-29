import type { Metadata } from "next";
import { BeautyPageShell, PageHero, BeautyPortalGrid, PortalPanel, SectionIntro, SoftCards, TelegramCTA } from "@/components/portal-components";

export const metadata: Metadata = {
  title: "Профиль — Красавица",
  description: "Будущий beauty-профиль Красавицы: история подборов, избранные средства, параметры кожи и подписка.",
  alternates: { canonical: "/profile" },
};

export default function ProfilePage() {
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

  return (
    <BeautyPageShell>
      <PageHero
        eyebrow="Профиль"
        title="Ваш beauty-профиль"
        subtitle="Здесь будут храниться подборы, любимые средства, параметры кожи и история рекомендаций."
        cta="Продолжить в Telegram"
        tiles={["История", "Избранное", "Параметры", "Подписка"]}
      />
      <div className="px-3 py-2 md:px-5">
        <BeautyPortalGrid className="min-h-[640px]">
          <PortalPanel className="md:col-span-5" image="/beauty-products-portal.png">
            <div className="flex min-h-[560px] flex-col justify-between">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Демо-профиль</p>
                <h2 className="mt-4 text-[clamp(2.5rem,4.6vw,5rem)] font-black leading-none">
                  Личная карта ухода без регистрации
                </h2>
                <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-[var(--color-text-muted)]">
                  Это визуальный прототип профиля. Он показывает будущую структуру кабинета, но пока не сохраняет и не отправляет данные.
                </p>
              </div>
              <div className="liquid-glass rounded-[var(--radius-lg)] border border-white/60 bg-white/38 p-4 backdrop-blur-2xl">
                <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Статус</p>
                <p className="mt-2 text-2xl font-black">Тестовый режим</p>
              </div>
            </div>
          </PortalPanel>
          <PortalPanel className="md:col-span-7">
            <div className="grid h-full gap-3">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Анкета</p>
                <h3 className="mt-3 text-4xl font-black leading-none">Параметры кожи</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {profileFields.map((field) => (
                  <label key={field.label} className="apple-glass-card rounded-[var(--radius-md)] border border-white/60 bg-white/42 p-4 backdrop-blur-2xl">
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
              <div className="grid gap-3 md:grid-cols-[1fr_0.8fr]">
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white/36 p-4 backdrop-blur-2xl">
                  <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Избранное</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["SPF без блеска", "Крем для барьера", "Мягкое очищение", "Сыворотка без липкости"].map((item) => (
                      <span key={item} className="rounded-full border border-[var(--color-border)] bg-white/48 px-4 py-2 text-sm font-black text-[var(--color-text-muted)]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <button type="button" className="apple-glass-button rounded-[var(--radius-md)] border border-black/10 bg-black p-4 text-left text-white shadow-[var(--shadow-card)]">
                  <span className="text-xs font-black uppercase text-white/45">Неактивно</span>
                  <span className="mt-3 block text-2xl font-black leading-tight">Сохранение появится позже</span>
                </button>
              </div>
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </div>
      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-4">
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">История</p>
            <h2 className="mt-4 text-[clamp(2.1rem,3.6vw,3.8rem)] font-black leading-none">Как будет выглядеть лента подборов</h2>
          </PortalPanel>
          <PortalPanel className="md:col-span-8">
            <div className="grid gap-2">
              {history.map(([date, title]) => (
                <div key={title} className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-white/60 bg-white/42 p-4 backdrop-blur-2xl">
                  <div>
                    <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">{date}</p>
                    <p className="mt-1 text-xl font-black">{title}</p>
                  </div>
                  <span className="rounded-full bg-black px-4 py-2 text-xs font-black uppercase text-white">Preview</span>
                </div>
              ))}
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>
      <SectionIntro kicker="Контекст" title="Чем больше Красавица знает о вашем уходе, тем точнее становится подбор" text="История реакций, бюджет и любимые текстуры помогут не начинать выбор заново каждый раз." />
      <SoftCards
        items={[
          { title: "История подборов", text: "Возвращайтесь к прошлым рекомендациям и смотрите, что уже пробовали." },
          { title: "Избранное", text: "Сохраняйте средства, которые понравились или требуют повторной проверки." },
          { title: "Параметры кожи", text: "Тип кожи, чувствительность, бюджет и ограничения будут храниться в одном месте." },
        ]}
      />
      <TelegramCTA title="Пока профиль живет в Telegram" text="Продолжите подбор в чате, чтобы рекомендации не потерялись." />
    </BeautyPageShell>
  );
}
