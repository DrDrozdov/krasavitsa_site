"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, Bot, Droplets, Heart, History, Scissors, Send, Sparkles, UserRound } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { BrandMark } from "@/components/brand-mark";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 80, damping: 22, mass: .7 });
  const smoothY = useSpring(pointerY, { stiffness: 80, damping: 22, mass: .7 });
  const mediaX = useTransform(smoothX, (value) => value * -0.7);
  const mediaY = useTransform(smoothY, (value) => value * -0.55);
  const typeX = useTransform(smoothX, (value) => value * .24);
  const typeY = useTransform(smoothY, (value) => value * .18);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(heroProgress, [0, .68, 1], [1, .975, .84]);
  const wordScrollY = useTransform(heroProgress, [0, 1], [0, 190]);
  const wordOpacity = useTransform(heroProgress, [0, .58, 1], [.58, .48, 0]);
  const coreScale = useTransform(heroProgress, [0, .52, 1], [1, 1.18, .48]);
  const handoffY = useTransform(heroProgress, [.4, 1], [56, 0]);
  const handoffOpacity = useTransform(heroProgress, [.35, .82, 1], [0, .65, 1]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion) video.pause();
    else void video.play().catch(() => undefined);
  }, [reduceMotion]);

  return (
    <main className="site-shell home-page cinematic-site">
      <SiteHeader />

      <section
        ref={heroRef}
        className="beauty-film-stage"
        onPointerMove={(event) => {
          if (reduceMotion || event.pointerType !== "mouse") return;
          const rect = event.currentTarget.getBoundingClientRect();
          pointerX.set(((event.clientX - rect.left) / rect.width - .5) * 28);
          pointerY.set(((event.clientY - rect.top) / rect.height - .5) * 24);
        }}
        onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}
      >
        <motion.div className="beauty-film-hero" style={reduceMotion ? undefined : { scale: heroScale }}>
          <div className="beauty-film-backdrop" aria-hidden="true">
            <Image src="/krasavitsa-cinematic-hero-v2.png" alt="" fill priority sizes="100vw" className="beauty-film-poster" />
            <motion.div className="beauty-film-video" style={reduceMotion ? undefined : { x: mediaX, y: mediaY }}>
              <video ref={videoRef} autoPlay muted loop playsInline preload="metadata" poster="/krasavitsa-cinematic-hero-v2.png">
                <source src="/krasavitsa-beauty-loop-source.mp4" type="video/mp4" />
              </video>
            </motion.div>
            <div className="beauty-film-vignette" />
            <span className="beauty-film-light beauty-film-light-a" />
            <span className="beauty-film-light beauty-film-light-b" />
          </div>

          <motion.div className="beauty-film-type-track" style={reduceMotion ? undefined : { y: wordScrollY, opacity: wordOpacity }} aria-hidden="true">
            <motion.div className="beauty-film-word" style={reduceMotion ? undefined : { x: typeX, y: typeY }}>КРАСАВИЦА</motion.div>
          </motion.div>

          <motion.div className="beauty-film-core" style={reduceMotion ? undefined : { scale: coreScale }} aria-hidden="true">
            <span className="beauty-film-orbit" />
            <span className="beauty-film-orbit beauty-film-orbit-inner" />
            <BrandMark className="beauty-film-logo" priority />
          </motion.div>

          <motion.div className="beauty-film-manifest" initial={reduceMotion ? false : { opacity: 0, y: 30, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: reduceMotion ? 0 : .9, delay: .12, ease: [0.16, 1, 0.3, 1] }}>
            <p className="hero-index">BEAUTY INTELLIGENCE / 2026</p>
            <h1>Ваш beauty‑контекст.<br /><em>Собран в ясный выбор.</em></h1>
            <p>AI-подбор ухода и ароматов с учётом чувствительности, привычек, бюджета и реальной жизни.</p>
            <div className="hero-actions-v2">
              <LinkButton href="/care" className="hero-primary-v2" data-analytics="hero_search">Собрать подбор <ArrowRight /></LinkButton>
              <LinkButton href="/about" tone="secondary" className="hero-ghost-v2">Как это устроено</LinkButton>
            </div>
          </motion.div>

          <div className="beauty-film-caption" aria-hidden="true"><span>MACRO BEAUTY STUDY / NO. 01</span><span>SCROLL TO DISCOVER</span></div>
          <div className="beauty-film-proof" aria-label="Особенности сервиса"><span>03 направления</span><span>02 этапа проверки</span><span>01 понятный сценарий</span></div>
        </motion.div>
      </section>

      <motion.section className="hero-handoff section-shell" style={reduceMotion ? undefined : { y: handoffY, opacity: handoffOpacity }} aria-label="Переход к возможностям Красавицы">
        <span className="hero-handoff-line" aria-hidden="true" />
        <BrandMark className="hero-handoff-logo" />
        <p>Один запрос проходит путь от контекста к проверенным карточкам — продолжайте вниз.</p>
        <ArrowDownRight aria-hidden="true" />
      </motion.section>

      <section className="kinetic-marquee" aria-hidden="true"><div><span>Кожа</span><i>✦</i><span>Волосы</span><i>✦</i><span>Ароматы</span><i>✦</i><span>Ваш ритм</span><i>✦</i><span>Кожа</span><i>✦</i><span>Волосы</span><i>✦</i><span>Ароматы</span></div></section>

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

      <section className="journal-preview section-shell">
        <div><p className="section-code">КРАСАВИЦА · JOURNAL</p><h2>Читать медленнее.<br />Выбирать увереннее.</h2></div>
        <Link href="/blog" className="journal-cover">
          <Image src="/beauty-bg-03.svg" alt="" fill sizes="(min-width: 900px) 62vw, 100vw" />
          <span>Выбор редакции</span><strong>Как отличить понятный уход от перегруженной рутины</strong><ArrowRight />
        </Link>
        <div className="journal-note"><p>Материалы о составах, SPF, привычках и ароматах — без бесконечной тревожной ленты.</p><LinkButton href="/blog" tone="secondary">Открыть журнал <ArrowRight /></LinkButton></div>
      </section>

      <section className="community-v2 section-shell">
        <div><p className="section-code">STAY IN THE LOOP</p><h2>Красавица<br />в вашем формате.</h2></div>
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
