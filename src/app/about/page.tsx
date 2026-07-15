import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Brain, Send, ShieldCheck, Sparkles } from "lucide-react";
import {
  BeautyPageShell,
  InstagramIcon,
  VkIcon,
} from "@/components/portal-components";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "О проекте | Красавица",
  description: "Как Красавица превращает запрос о коже, волосах или аромате в понятный персональный сценарий.",
  alternates: { canonical: "/about" },
};

const principles = [
  {
    title: "Контекст важнее тренда",
    text: "Бюджет, чувствительность, ритм жизни и прошлый опыт важнее громкости продукта в ленте.",
    Icon: Brain,
  },
  {
    title: "Объяснение важнее списка",
    text: "В каждом сценарии должно быть понятно, зачем нужен шаг и что можно убрать без потери смысла.",
    Icon: Sparkles,
  },
  {
    title: "Контроль остаётся у вас",
    text: "Профиль, история, избранное и аналитика устроены прозрачно. Пользователь выбирает, что сохранять.",
    Icon: ShieldCheck,
  },
];

export default function AboutPage() {
  return (
    <BeautyPageShell className="about-motion-page">
      <section className="about-new-hero section-shell">
        <div className="about-new-copy">
          <p className="eyebrow">О проекте</p>
          <h1>Выбирать красоту можно без шума.</h1>
          <p>
            Красавица переводит обычный запрос в понятный план для кожи, волос или аромата. Не магазин и не диагноз. Личный инструмент выбора.
          </p>
          <div>
            <LinkButton href="/care">Попробовать подбор <ArrowRight /></LinkButton>
            <LinkButton href="/profile" tone="secondary">Создать профиль</LinkButton>
          </div>
        </div>
        <div className="about-new-visual">
          <Image src="/about/about-beauty-path-v2.png" alt="Абстрактная композиция косметических флаконов" fill priority sizes="(min-width: 900px) 52vw, 100vw" />
          <div className="about-new-stamp"><span>01</span><strong>Запрос становится сценарием</strong></div>
        </div>
      </section>

      <section className="about-manifesto section-shell">
        <p className="eyebrow-inverse">Зачем мы это делаем</p>
        <h2><span>Меньше</span> случайных покупок.<br /><span>Больше</span> уверенных решений.</h2>
        <p>Хороший подбор не заставляет запоминать сотни ингредиентов. Он задаёт правильные вопросы, уважает ограничения и оставляет ясный следующий шаг.</p>
      </section>

      <section className="about-principles section-shell">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">Три принципа</p><h2>На чём держится Красавица.</h2></div>
          <p>Вместо длинного roadmap показываем правила, которые уже определяют продукт и каждое новое решение.</p>
        </div>
        <div className="about-principle-list">
          {principles.map(({ title, text, Icon }, index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-ecosystem section-shell">
        <div>
          <p className="eyebrow">Один контекст</p>
          <h2>Сайт, профиль и Telegram работают как одна среда.</h2>
          <p>Начните подбор в браузере, сохраните результат в профиле или продолжите диалог в привычном чате.</p>
          <LinkButton href="https://t.me/krasavitsa_ai_bot"><Bot /> Открыть Telegram-бота</LinkButton>
        </div>
        <div className="about-social-rail" aria-label="Сообщества Красавицы">
          <Social href="https://t.me/krasavitsa_ai_bot" label="Бот"><Bot /></Social>
          <Social href="https://t.me/krasavitsa_ai" label="Telegram"><Send /></Social>
          <Social href="https://www.instagram.com/krasavitsa_ai?utm_source=qr" label="Instagram"><InstagramIcon /></Social>
          <Social href="https://vk.ru/krasavitsa_ai" label="VK"><VkIcon /></Social>
        </div>
      </section>
    </BeautyPageShell>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return <Link href={href} target="_blank" rel="noreferrer"><span>{children}</span><strong>{label}</strong><ArrowRight /></Link>;
}
