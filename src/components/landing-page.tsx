"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bot, Droplets, Heart, History, Scissors, Send, Sparkles, UserRound } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { InstagramIcon, SiteFooter, SiteHeader, VkIcon } from "@/components/portal-components";
import { LinkButton } from "@/components/ui/button";
import { DigitalLotus } from "@/components/digital-lotus";
import { HeroRibbonField } from "@/components/hero-ribbon-field";

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
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end end"] });
  const heroScale = useTransform(heroProgress, [0, .54, .78, 1], [1, 1, .99, .955]);
  const heroRadius = useTransform(heroProgress, [0, .54, .78, 1], [0, 0, 18, 42]);
  const ribbonScale = useTransform(heroProgress, [0, .3, .57, .8], [1, 1.05, 1.48, 3.6]);
  const ribbonRotate = useTransform(heroProgress, [0, .38, .8], [0, -2, 11]);
  const ribbonOpacity = useTransform(heroProgress, [.56, .76, .9], [1, .76, 0]);
  const lotusScale = useTransform(heroProgress, [0, .18, .48, .7], [.38, .46, .54, .82]);
  const lotusY = useTransform(heroProgress, [0, .44, .76], [0, -4, -28]);
  const lotusRotate = useTransform(heroProgress, [0, .5, .76], [0, -2, 4]);
  const lotusOpacity = useTransform(heroProgress, [.68, .82, .9], [1, .5, 0]);
  const lotusBloom = useTransform(heroProgress, [0, .16, .34, .48], [.08, .14, .56, 1]);
  const lotusScatter = useTransform(heroProgress, [.38, .7], [0, 1]);
  const titleY = useTransform(heroProgress, [0, .28, .54], [0, -8, -72]);
  const titleScale = useTransform(heroProgress, [0, .3, .58], [1, .98, .9]);
  const titleOpacity = useTransform(heroProgress, [0, .3, .58], [1, .92, 0]);
  const detailOpacity = useTransform(heroProgress, [0, .2, .48], [1, .8, 0]);
  const transitionY = useTransform(heroProgress, [.53, .82], ["101%", "0%"]);
  const transitionRadius = useTransform(heroProgress, [.53, .82], [72, 0]);
  const transitionCopyY = useTransform(heroProgress, [.61, .84], [110, 0]);
  const transitionCopyOpacity = useTransform(heroProgress, [.61, .76, .88], [0, .62, 1]);

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
          <motion.div className="aerocore-hero" style={reduceMotion ? undefined : { scale: heroScale, borderRadius: heroRadius }}>
            <motion.div className="aerocore-media" style={reduceMotion ? undefined : { x: mediaX, y: mediaY }} aria-hidden="true">
              <motion.div className="aerocore-ribbon-stage" style={reduceMotion ? undefined : { scale: ribbonScale, rotate: ribbonRotate, opacity: ribbonOpacity }}>
                <HeroRibbonField />
              </motion.div>
              <div className="aerocore-plane-lines" />
              <motion.div
                className="aerocore-lotus-stage"
                style={reduceMotion ? { "--lotus-bloom": 1 } as CSSProperties : {
                  scale: lotusScale,
                  y: lotusY,
                  rotate: lotusRotate,
                  opacity: lotusOpacity,
                  "--lotus-bloom": lotusBloom,
                  "--lotus-scatter": lotusScatter,
                } as never}
              >
                <DigitalLotus className="aerocore-lotus" />
              </motion.div>
              <div className="aerocore-wash" />
            </motion.div>

            <motion.div className="aerocore-intro" style={reduceMotion ? undefined : { x: typeX, y: titleY, scale: titleScale, opacity: titleOpacity }}>
              <span>PERSONAL BEAUTY INTELLIGENCE</span>
              <h1>Красавица</h1>
              <p>AI-подбор ухода, волос и ароматов.</p>
            </motion.div>

            <motion.div className="aerocore-hero-detail" style={reduceMotion ? undefined : { opacity: detailOpacity }}>
              <p>Точный выбор без лишнего шума.</p>
              <LinkButton href="/care" className="aerocore-action" data-analytics="hero_search">Начать подбор <ArrowRight /></LinkButton>
            </motion.div>
          </motion.div>

          <motion.div
            className="aerocore-transition-sheet"
            style={reduceMotion ? undefined : { y: transitionY, borderTopLeftRadius: transitionRadius, borderTopRightRadius: transitionRadius }}
          >
            <motion.div style={reduceMotion ? undefined : { y: transitionCopyY, opacity: transitionCopyOpacity }}>
              <span>01 · ЗАПРОС СТАНОВИТСЯ СИСТЕМОЙ</span>
              <strong>Красота начинается с вопроса.</strong>
              <p>Три направления. Одна ясная логика выбора.</p>
            </motion.div>
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
          <div className="intelligence-orbital" aria-hidden="true">
            <span /><span /><span /><span />
            <DigitalLotus compact />
          </div>
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
          <div className="memory-orbit-art" aria-hidden="true"><span /><span /><span /><UserRound /></div>
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
  return <motion.a href={href} target="_blank" rel="noreferrer" aria-label={label} whileHover={reduceMotion ? undefined : { y: -6, rotate: -1.4 }} whileTap={reduceMotion ? undefined : { scale: .96 }}><span>{children}</span><strong>{label}</strong><ArrowUpRight /></motion.a>;
}
