"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, Bot, Droplets, Heart, History, Scissors, Send, Sparkles, UserRound } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 80, damping: 22, mass: .7 });
  const smoothY = useSpring(pointerY, { stiffness: 80, damping: 22, mass: .7 });
  const mediaX = useTransform(smoothX, (value) => value * -0.7);
  const mediaY = useTransform(smoothY, (value) => value * -0.55);
  const typeX = useTransform(smoothX, (value) => value * .24);
  const typeY = useTransform(smoothY, (value) => value * .18);

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
        className="cinematic-hero"
        onPointerMove={(event) => {
          if (reduceMotion || event.pointerType !== "mouse") return;
          const rect = event.currentTarget.getBoundingClientRect();
          pointerX.set(((event.clientX - rect.left) / rect.width - .5) * 28);
          pointerY.set(((event.clientY - rect.top) / rect.height - .5) * 24);
        }}
        onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}
      >
        <div className="cinematic-hero-backdrop" aria-hidden="true">
          <Image src="/krasavitsa-cinematic-hero-v2.png" alt="" fill priority sizes="100vw" className="cinematic-hero-poster" />
          <motion.div className="cinematic-video-window" style={{ x: mediaX, y: mediaY }}>
            <video ref={videoRef} autoPlay muted loop playsInline preload="metadata" poster="/krasavitsa-cinematic-hero-v2.png">
              <source src="/krasavitsa-beauty-loop-source.mp4" type="video/mp4" />
            </video>
          </motion.div>
          <div className="cinematic-vignette" />
          <span className="hero-orbit hero-orbit-one" /><span className="hero-orbit hero-orbit-two" />
        </div>

        <motion.div className="cinematic-wordmark" style={{ x: typeX, y: typeY }} aria-label="Красавица">
          <span>КРАСА</span><span>ВИЦА</span>
        </motion.div>

        <motion.div className="hero-manifest" initial={false} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}>
          <p className="hero-index">BEAUTY INTELLIGENCE / 2026</p>
          <h1>Не ещё одна полка.<br /><em>Ваш понятный выбор.</em></h1>
          <p>AI-подбор ухода и ароматов, который учитывает реальную жизнь: чувствительность, привычки, бюджет и контекст.</p>
          <div className="hero-actions-v2">
            <LinkButton href="/care" className="hero-primary-v2" data-analytics="hero_search">Собрать подбор <ArrowRight /></LinkButton>
            <LinkButton href="/about" tone="secondary" className="hero-ghost-v2">Как это устроено</LinkButton>
          </div>
        </motion.div>

        <div className="hero-signal" aria-hidden="true"><span>SCROLL TO DISCOVER</span><ArrowDownRight /></div>
        <div className="hero-proof" aria-label="Особенности сервиса"><span>03 направления</span><span>02 этапа проверки</span><span>01 понятный сценарий</span></div>
      </section>

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
