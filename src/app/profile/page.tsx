import type { Metadata } from "next";
import { ProfileDemo } from "@/components/profile-demo";
import { BeautyPageShell, PageHero, SectionIntro, SoftCards, TelegramCTA } from "@/components/portal-components";

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
      <ProfileDemo />
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
