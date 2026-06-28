import type { Metadata } from "next";
import { BeautyPageShell, PageHero, BeautyPortalGrid, PortalPanel, SectionIntro, SoftCards, TelegramCTA } from "@/components/portal-components";

export const metadata: Metadata = {
  title: "Профиль — Красавица",
  description: "Будущий beauty-профиль Красавицы: история подборов, избранные средства, параметры кожи и подписка.",
  alternates: { canonical: "/profile" },
};

export default function ProfilePage() {
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
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-6">
            <h2 className="text-[clamp(2.4rem,4.8vw,5rem)] font-black leading-none">Профиль скоро появится на сайте</h2>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-[var(--color-text-muted)]">
              Сейчас рекомендации можно сохранять и получать через Telegram. Профиль на сайте станет личной историей ухода и избранных средств.
            </p>
          </PortalPanel>
          <PortalPanel className="md:col-span-6" image="/beauty-products-portal.png">
            <div className="grid h-full gap-3 sm:grid-cols-2">
              {["История подборов", "Избранные средства", "Параметры кожи", "Подписка"].map((item) => (
                <div key={item} className="rounded-[var(--radius-md)] border border-white/60 bg-white/52 p-5 text-xl font-black backdrop-blur-2xl">
                  {item}
                </div>
              ))}
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </div>
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
