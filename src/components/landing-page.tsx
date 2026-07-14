"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Droplets,
  Heart,
  History,
  Scissors,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  InstagramIcon,
  SiteFooter,
  SiteHeader,
  VkIcon,
} from "@/components/portal-components";
import { LinkButton } from "@/components/ui/button";

const directions = [
  {
    label: "Кожа",
    text: "Барьер, активы, чувствительность и SPF.",
    Icon: Droplets,
  },
  {
    label: "Волосы",
    text: "Кожа головы, длина, окрашивание и укладка.",
    Icon: Scissors,
  },
  {
    label: "Ароматы",
    text: "Ноты, настроение, повод, бюджет и шлейф.",
    Icon: Sparkles,
  },
];

const process = [
  ["Опишите ситуацию", "Пишите как есть: задача, бюджет, ограничения и то, что уже пробовали."],
  ["Получите логику", "AI соберёт сценарий и объяснит роль каждого средства без рекламного шума."],
  ["Сохраните контекст", "Избранное и история остаются в профиле, чтобы не начинать заново."],
];

export function LandingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="site-shell home-page">
      <SiteHeader />

      <section className="home-hero section-shell" id="home">
        <motion.div
          className="home-hero-copy"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.64, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow">Персональный beauty AI</p>
          <h1>Уход, который понимает ваш ритм.</h1>
          <p className="home-hero-text">
            Опишите задачу обычными словами. Красавица учтёт бюджет, чувствительность и привычки, затем соберёт понятный сценарий.
          </p>
          <div className="home-hero-actions">
            <LinkButton href="/care" className="hero-primary">Начать подбор <ArrowRight /></LinkButton>
            <LinkButton href="/profile" tone="secondary"><UserRound /> Мой профиль</LinkButton>
          </div>
          <div className="home-proofline" aria-label="Направления подбора">
            <span>Кожа</span><i /><span>Волосы</span><i /><span>Ароматы</span>
          </div>
        </motion.div>

        <motion.div
          className="home-hero-media"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.76, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="/krasavitsa-editorial-hero.png"
            alt="Абстрактная композиция с косметическими флаконами в бордово-пудровой палитре"
            fill
            priority
            sizes="(min-width: 900px) 52vw, 100vw"
            className="home-hero-image"
          />
          <div className="home-hero-sheen" />
          <div className="home-hero-note">
            <Sparkles aria-hidden="true" />
            <div><span>Не список банок</span><strong>Сценарий, который можно повторить</strong></div>
          </div>
          <a href="#directions" className="hero-scroll" aria-label="Перейти к направлениям"><ArrowDown /></a>
        </motion.div>
      </section>

      <section className="direction-section section-shell" id="directions">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">Один вход</p><h2>Три разных способа выбирать.</h2></div>
          <p>Каждое направление меняет вопросы, примеры и правила подбора. Интерфейс остаётся знакомым, логика становится точнее.</p>
        </div>
        <div className="direction-list">
          {directions.map(({ label, text, Icon }, index) => (
            <motion.div
              key={label}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.46, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/care" className="direction-row">
                <span className="direction-index">0{index + 1}</span>
                <span className="direction-icon"><Icon /></span>
                <strong>{label}</strong>
                <p>{text}</p>
                <ArrowRight className="direction-arrow" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="home-process section-shell" id="features">
        <div className="process-visual">
          <Image src="/recommendations/skin-packshot-v1.png" alt="Косметические средства для сценария ухода" fill sizes="(min-width: 900px) 44vw, 100vw" />
          <div className="process-orb" aria-hidden="true"><i /><i /><i /><Sparkles /></div>
          <span className="process-caption">Контекст → логика → выбор</span>
        </div>
        <div className="process-copy">
          <p className="eyebrow">Как это работает</p>
          <h2>Меньше поиска. Больше понимания.</h2>
          <div className="process-list">
            {process.map(([title, text], index) => (
              <article key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></article>
            ))}
          </div>
          <LinkButton href="/care">Попробовать на своём запросе <ArrowRight /></LinkButton>
        </div>
      </section>

      <section className="profile-story section-shell">
        <div className="profile-story-copy">
          <p className="eyebrow-inverse">Память, которой управляете вы</p>
          <h2>Профиль помнит полезное, а не лишнее.</h2>
          <p>Сохраняйте удачные средства и возвращайтесь к прошлым подборам. Настройки аналитики остаются под вашим контролем.</p>
          <LinkButton href="/profile" className="button-light"><UserRound /> Открыть профиль</LinkButton>
        </div>
        <div className="profile-miniatures">
          <article><Heart /><span>Избранное</span><strong>Всё удачное рядом</strong></article>
          <article><History /><span>История</span><strong>Не начинайте с нуля</strong></article>
        </div>
      </section>

      <section className="community-section section-shell">
        <div>
          <p className="eyebrow">Красавица рядом</p>
          <h2>Выберите удобный формат общения.</h2>
          <p>Подбор в боте, новости проекта и короткие визуальные разборы.</p>
        </div>
        <div className="community-links">
          <CommunityLink href="https://t.me/krasavitsa_ai_bot" label="Telegram-бот"><Bot /></CommunityLink>
          <CommunityLink href="https://t.me/krasavitsa_ai" label="Telegram"><Send /></CommunityLink>
          <CommunityLink href="https://www.instagram.com/krasavitsa_ai?utm_source=qr" label="Instagram"><InstagramIcon /></CommunityLink>
          <CommunityLink href="https://vk.ru/krasavitsa_ai" label="VK"><VkIcon /></CommunityLink>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function CommunityLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <motion.a href={href} target="_blank" rel="noreferrer" aria-label={label} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}>
      <span>{children}</span><strong>{label}</strong><ArrowRight />
    </motion.a>
  );
}
