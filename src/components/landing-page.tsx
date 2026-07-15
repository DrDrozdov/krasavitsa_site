"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Droplets, Heart, History, Scissors, Send, Sparkles, UserRound } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { InstagramIcon, SiteFooter, SiteHeader, VkIcon } from "@/components/portal-components";
import { LinkButton } from "@/components/ui/button";

const directions = [
  { label: "Кожа", number: "01", text: "Барьер, активы, чувствительность и SPF", Icon: Droplets },
  { label: "Волосы", number: "02", text: "Кожа головы, длина, окрашивание и укладка", Icon: Scissors },
  { label: "Ароматы", number: "03", text: "Ноты, настроение, повод, бюджет и шлейф", Icon: Sparkles },
];

const process = [
  ["Контекст", "Опишите задачу, бюджет, ограничения и то, что уже пробовали."],
  ["Проверка", "Два этапа сверяют товары, ссылки и то, насколько они отвечают запросу."],
  ["Сценарий", "Получите короткий совет, карточки средств и понятную роль каждого шага."],
];

export function LandingPage() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 80, damping: 22, mass: .7 });
  const smoothY = useSpring(pointerY, { stiffness: 80, damping: 22, mass: .7 });
  const mediaX = useTransform(smoothX, (value) => value * -0.7);
  const mediaY = useTransform(smoothY, (value) => value * -0.55);
  const typeX = useTransform(smoothX, (value) => value * .24);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(heroProgress, [0, .48, 1], [1, .972, .86]);
  const heroRadius = useTransform(heroProgress, [0, .5, 1], [0, 10, 18]);
  const lotusScale = useTransform(heroProgress, [0, .58, 1], [1, 1.1, 1.62]);
  const lotusY = useTransform(heroProgress, [0, 1], [0, -126]);
  const lotusOpacity = useTransform(heroProgress, [.5, 1], [1, .14]);
  const titleY = useTransform(heroProgress, [0, .5, 1], [0, -18, -118]);
  const titleOpacity = useTransform(heroProgress, [0, .62, 1], [1, .9, 0]);
  const detailOpacity = useTransform(heroProgress, [0, .28, .66], [1, .76, 0]);
  const revealY = useTransform(heroProgress, [.44, 1], [112, 0]);
  const revealOpacity = useTransform(heroProgress, [.42, .7, 1], [0, .65, 1]);

  return (
    <main className="site-shell home-page cinematic-site">
      <SiteHeader />

      <section
        ref={heroRef}
        className="aerocore-stage"
        onPointerMove={(event) => {
          if (reduceMotion || event.pointerType !== "mouse") return;
          const rect = event.currentTarget.getBoundingClientRect();
          pointerX.set(((event.clientX - rect.left) / rect.width - .5) * 28);
          pointerY.set(((event.clientY - rect.top) / rect.height - .5) * 24);
        }}
        onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}
      >
        <div className="aerocore-sticky">
          <motion.div
            className="aerocore-hero"
            style={reduceMotion ? undefined : { scale: heroScale, borderRadius: heroRadius }}
          >
            <motion.div className="aerocore-media" style={reduceMotion ? undefined : { x: mediaX, y: mediaY }} aria-hidden="true">
              <motion.div className="aerocore-lotus-stage" style={reduceMotion ? undefined : { scale: lotusScale, y: lotusY, opacity: lotusOpacity }}>
                <Image src="/krasavitsa-lotus-hero-v1.png" alt="" fill priority sizes="100vw" className="aerocore-lotus" />
              </motion.div>
              <div className="aerocore-wash" />
            </motion.div>

            <motion.h1
              className="aerocore-title"
              style={reduceMotion ? undefined : { x: typeX, y: titleY, opacity: titleOpacity }}
            >
              Красавица
            </motion.h1>

            <motion.div
              className="aerocore-hero-detail"
              style={reduceMotion ? undefined : { opacity: detailOpacity }}
            >
              <p>Персональный AI-подбор ухода, волос и ароматов.</p>
              <LinkButton href="/care" className="aerocore-action" data-analytics="hero_search">Начать подбор <ArrowRight /></LinkButton>
            </motion.div>

          </motion.div>

          <motion.div className="aerocore-reveal-panel" style={reduceMotion ? undefined : { opacity: revealOpacity, y: revealY }} aria-hidden="true">
            <span>Лотос раскрывается в ваш сценарий</span>
            <strong>Выберите направление — и начнём.</strong>
            <div><i>Кожа</i><i>Волосы</i><i>Ароматы</i></div>
          </motion.div>
        </div>
      </section>

      <section className="direction-editorial section-shell" id="directions">
        <div className="editorial-heading">
          <p>ТРИ РЕЖИМА · ОДНА ЛОГИКА</p>
          <h2>Красота начинается<br />не с банки, а с вопроса.</h2>
          <span>Выберите направление — интерфейс задаст правильные уточнения и не смешает правила кожи, волос и парфюмерии.</span>
        </div>
        <div className="direction-rack">
          {directions.map(({ label, number: index, text, Icon }, order) => (
            <motion.div key={label} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: .62, delay: order * .08, ease: [0.16, 1, 0.3, 1] }}>
              <Link href="/care" className="direction-slab" data-direction={order + 1}>
                <span className="direction-number">{index}</span><Icon className="direction-glyph" /><strong>{label}</strong><p>{text}</p><ArrowRight />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="intelligence-stage section-shell">
        <div className="intelligence-visual">
          <Image src="/krasavitsa-cinematic-hero-v2.png" alt="Абстрактная композиция с косметическими флаконами без лиц" fill sizes="(min-width: 900px) 48vw, 100vw" />
          <div className="intelligence-scan" aria-hidden="true" />
          <div className="intelligence-object" aria-hidden="true"><span /><span /><span /><Sparkles /></div>
          <p>Не магия. Система проверок.</p>
        </div>
        <div className="intelligence-copy">
          <p className="section-code">HOW IT THINKS / 03 STEPS</p>
          <h2>Из запроса —<br /><em>в ясный сценарий.</em></h2>
          <div className="process-editorial">
            {process.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
          </div>
          <LinkButton href="/care" className="process-action">Попробовать на своём запросе <ArrowRight /></LinkButton>
        </div>
      </section>

      <section className="memory-theatre section-shell">
        <div className="memory-copy">
          <p className="section-code section-code-light">YOUR BEAUTY MEMORY</p>
          <h2>Профиль хранит<br />полезное. <em>Не лишнее.</em></h2>
          <p>Избранное, история подборов и авторские статьи остаются в одном пространстве. Вы решаете, что сохранить.</p>
          <LinkButton href="/profile" className="memory-action"><UserRound /> Открыть профиль</LinkButton>
        </div>
        <div className="memory-ledger">
          <article><Heart /><span>01</span><div><strong>Избранное</strong><p>Средства, к которым хочется вернуться</p></div></article>
          <article><History /><span>02</span><div><strong>История</strong><p>Контекст прошлых решений без повторного старта</p></div></article>
          <article><Sparkles /><span>03</span><div><strong>Редакция</strong><p>Собственный материал и живой опыт сообщества</p></div></article>
        </div>
      </section>

      <section className="community-v2 section-shell">
        <div><p className="section-code">ГДЕ ВАМ УДОБНО</p><h2>Красавица — рядом.</h2></div>
        <div className="community-orbit-links">
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
  const reduceMotion = useReducedMotion();
  return <motion.a href={href} target="_blank" rel="noreferrer" aria-label={label} whileHover={reduceMotion ? undefined : { y: -6, rotate: -1.4 }} whileTap={reduceMotion ? undefined : { scale: .96 }}><span>{children}</span><strong>{label}</strong><ArrowRight /></motion.a>;
}
