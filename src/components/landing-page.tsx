"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  Droplets,
  Heart,
  History,
  Scissors,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, type ReactNode } from "react";
import { HeroGlassLotus } from "@/components/hero-glass-lotus";
import { InstagramIcon, SiteFooter, SiteHeader, VkIcon } from "@/components/portal-components";
import { LinkButton } from "@/components/ui/button";
import styles from "./landing-page.module.css";

const directions = [
  {
    label: "Кожа",
    number: "01",
    text: "Барьер, активы, чувствительность и SPF",
    note: "Собираем уход вокруг состояния кожи, а не тренда.",
    Icon: Droplets,
  },
  {
    label: "Волосы",
    number: "02",
    text: "Кожа головы, длина, окрашивание и укладка",
    note: "Разделяем потребности кожи головы и полотна волос.",
    Icon: Scissors,
  },
  {
    label: "Ароматы",
    number: "03",
    text: "Ноты, настроение, повод, бюджет и шлейф",
    note: "Переводим впечатление в понятный профиль аромата.",
    Icon: Sparkles,
  },
];

const process = [
  {
    title: "Контекст",
    text: "Задача, бюджет, ограничения и то, что вы уже пробовали.",
    metric: "ваши вводные",
  },
  {
    title: "Проверка",
    text: "Состав, назначение, актуальные карточки товаров и доступность.",
    metric: "2 уровня сверки",
  },
  {
    title: "Сценарий",
    text: "Короткий совет, конкретные средства и роль каждого шага.",
    metric: "ясный результат",
  },
];

export function LandingPage() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 92, damping: 26, mass: 0.68 });
  const smoothY = useSpring(pointerY, { stiffness: 92, damping: 26, mass: 0.68 });
  const volumeX = useTransform(smoothX, (value) => value * -0.6);
  const volumeY = useTransform(smoothY, (value) => value * -0.42);
  const typeX = useTransform(smoothX, (value) => value * 0.2);
  const lotusRotateY = useTransform(smoothX, (value) => value * 0.18);

  const { scrollYProgress: rawProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });
  const heroProgress = useSpring(rawProgress, {
    stiffness: 58,
    damping: 27,
    mass: 0.62,
    restDelta: 0.0005,
    restSpeed: 0.0005,
  });

  // Only compositor properties are scrubbed. The organic silhouette is static;
  // light, scale and petal travel carry the state change without shape reflow.
  const volumeScale = useTransform(heroProgress, [0, 0.28, 0.58, 0.8, 1], [0.78, 0.91, 1.12, 1.56, 2.08]);
  const volumeLight = useTransform(heroProgress, [0, 0.28, 0.58, 0.82], [0.08, 0.26, 0.7, 1]);
  const volumeDepth = useTransform(heroProgress, [0, 0.44, 0.8], [0.92, 1.03, 1.22]);

  const lotusScale = useTransform(heroProgress, [0, 0.12, 0.34, 0.56, 0.76, 0.9], [0.25, 0.34, 0.68, 1.02, 1.24, 1.48]);
  const lotusY = useTransform(heroProgress, [0, 0.28, 0.56, 0.78], ["18vh", "12vh", "1vh", "-7vh"]);
  const lotusTilt = useTransform(heroProgress, [0, 0.32, 0.58, 0.76], [58, 48, 27, 17]);
  const lotusRotate = useTransform(heroProgress, [0, 0.42, 0.72], [-4, -1, 4]);
  const lotusOpacity = useTransform(heroProgress, [0, 0.08, 0.78, 0.94], [0.26, 0.62, 1, 0]);
  const lotusBloom = useTransform(heroProgress, [0, 0.15, 0.36, 0.58], [0.02, 0.09, 0.58, 1]);
  const coreOpacity = useTransform(heroProgress, [0.56, 0.75, 0.92], [1, 0.68, 0]);
  const leftFar = useTransform(heroProgress, [0.55, 0.88], ["0vw", "-72vw"]);
  const left = useTransform(heroProgress, [0.55, 0.88], ["0vw", "-48vw"]);
  const right = useTransform(heroProgress, [0.55, 0.88], ["0vw", "48vw"]);
  const rightFar = useTransform(heroProgress, [0.55, 0.88], ["0vw", "72vw"]);
  const upFar = useTransform(heroProgress, [0.55, 0.88], ["0vh", "-68vh"]);
  const up = useTransform(heroProgress, [0.55, 0.88], ["0vh", "-42vh"]);
  const down = useTransform(heroProgress, [0.55, 0.88], ["0vh", "48vh"]);

  const introOpacity = useTransform(heroProgress, [0, 0.27, 0.48], [1, 1, 0]);
  const introY = useTransform(heroProgress, [0, 0.48], [0, -48]);
  const introScale = useTransform(heroProgress, [0, 0.48], [1, 0.94]);
  const actionsOpacity = useTransform(heroProgress, [0, 0.28, 0.48], [1, 0.9, 0]);

  const bridgeOpacity = useTransform(heroProgress, [0.6, 0.68, 0.84], [0, 0.48, 1]);
  const bridgeScale = useTransform(heroProgress, [0.58, 0.76, 0.94], [0.035, 0.48, 1]);
  const bridgeCopyY = useTransform(heroProgress, [0.7, 0.9, 1], [52, 5, 0]);
  const bridgeCopyOpacity = useTransform(heroProgress, [0.68, 0.82, 0.94], [0, 0.24, 1]);

  return (
    <main className={styles.page}>
      <SiteHeader />

      <section
        ref={heroRef}
        className={styles.heroChapter}
        aria-labelledby="home-hero-title"
        onPointerMove={(event) => {
          if (reduceMotion || event.pointerType !== "mouse") return;
          const rect = event.currentTarget.getBoundingClientRect();
          pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 26);
          pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 20);
        }}
        onPointerLeave={() => {
          pointerX.set(0);
          pointerY.set(0);
        }}
      >
        <div className={styles.heroSticky}>
          <div className={styles.heroStage}>
            <div className={styles.heroGround} aria-hidden="true" />
            <motion.div
              className={styles.cherryVolume}
              style={reduceMotion
                ? undefined
                : {
                    x: volumeX,
                    y: volumeY,
                    scale: volumeScale,
                  }}
              aria-hidden="true"
            >
              <motion.span className={styles.volumeDepth} style={reduceMotion ? undefined : { scale: volumeDepth }} />
              <motion.span className={styles.volumeLight} style={reduceMotion ? undefined : { opacity: volumeLight }} />
              <span className={styles.volumeTexture} />
              <span className={styles.volumeRim} />
            </motion.div>

            <motion.div
              className={styles.glassLotus}
              style={reduceMotion
                ? ({ "--lotus-bloom": 1, "--lotus-core-opacity": 1 } as never)
                : ({
                    x: smoothX,
                    y: lotusY,
                    scale: lotusScale,
                    rotateX: lotusTilt,
                    rotateY: lotusRotateY,
                    rotateZ: lotusRotate,
                    opacity: lotusOpacity,
                    "--lotus-bloom": lotusBloom,
                    "--lotus-core-opacity": coreOpacity,
                    "--petal-left-far": leftFar,
                    "--petal-left": left,
                    "--petal-right": right,
                    "--petal-right-far": rightFar,
                    "--petal-up-far": upFar,
                    "--petal-up": up,
                    "--petal-down": down,
                  } as never)}
            >
              <HeroGlassLotus className={styles.lotusObject} />
            </motion.div>

            <motion.div
              className={styles.heroIntro}
              style={reduceMotion
                ? undefined
                : { x: typeX, y: introY, scale: introScale, opacity: introOpacity }}
            >
              <span>PERSONAL BEAUTY INTELLIGENCE</span>
              <h1 id="home-hero-title">Красавица</h1>
              <p>Персональный AI‑подбор ухода, волос и ароматов.</p>
            </motion.div>

            <motion.div
              className={styles.heroActions}
              style={reduceMotion ? undefined : { opacity: actionsOpacity }}
            >
              <p>Точный выбор без лишнего шума.</p>
              <LinkButton href="/care" className={styles.primaryAction} data-analytics="hero_search">
                Начать подбор <ArrowRight aria-hidden="true" />
              </LinkButton>
            </motion.div>
          </div>

          <motion.div
            className={styles.heroBridge}
            style={reduceMotion
              ? undefined
              : { opacity: bridgeOpacity, scale: bridgeScale }}
          >
            <motion.div
              className={styles.heroBridgeCopy}
              style={reduceMotion ? undefined : { y: bridgeCopyY, opacity: bridgeCopyOpacity }}
            >
              <span>Запрос становится системой</span>
              <h2>Красота начинается с вопроса.</h2>
              <p>Три направления. Одна ясная логика выбора.</p>
            </motion.div>
            <span className={styles.bridgePulse} aria-hidden="true" />
          </motion.div>
        </div>
      </section>

      <section className={styles.directions} id="directions" aria-labelledby="directions-title">
        <Reveal className={styles.modeIntro}>
          <div>
            <span>Три режима</span>
            <span>Одна логика</span>
          </div>
          <h2 id="directions-title">
            Выберите задачу.
            <br />
            <em>Остальное уточним.</em>
          </h2>
          <p>
            Интерфейс задаст только нужные вопросы и не смешает правила кожи, волос и парфюмерии.
          </p>
        </Reveal>

        <div className={styles.modeAtlas}>
          <Reveal className={styles.modeAxis}>
            <div aria-hidden="true">
              <span>03</span>
              <i />
              <i />
              <i />
            </div>
            <p>Точка входа меняется. Способ думать остаётся ясным.</p>
          </Reveal>

          <div className={styles.modeLanes}>
            {directions.map(({ label, number, text, note, Icon }, index) => (
              <Reveal key={label} className={styles.modeLaneWrap} delay={index * 0.06}>
                <Link href="/care" className={styles.modeLane}>
                  <span className={styles.modeNumber}>{number}</span>
                  <span className={styles.modeIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <strong>{label}</strong>
                  <span className={styles.modeDescription}>
                    <b>{text}</b>
                    <small>{note}</small>
                  </span>
                  <ArrowUpRight className={styles.modeArrow} aria-hidden="true" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.intelligence} aria-labelledby="intelligence-title">
        <Reveal className={styles.signalCanvas}>
          <div className={styles.queryNode}>
            <span>Ваш запрос</span>
            <strong>«Нужен мягкий уход без перегруза»</strong>
          </div>
          <div className={styles.signalRail} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className={styles.verificationNodes}>
            <span>
              <Check /> состав
            </span>
            <span>
              <Check /> наличие
            </span>
            <span>
              <Check /> роль
            </span>
          </div>
          <div className={styles.resultPreview}>
            <span>Сценарий готов</span>
            <strong>3 шага · 4 средства</strong>
            <div aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
        </Reveal>

        <Reveal className={styles.intelligenceCopy} delay={0.08}>
          <p className={styles.eyebrow}>HOW IT THINKS / 03 STEPS</p>
          <h2 id="intelligence-title">
            Из запроса —
            <br />
            <em>в ясный сценарий.</em>
          </h2>
          <div className={styles.processList}>
            {process.map(({ title, text, metric }, index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <small>{metric}</small>
              </article>
            ))}
          </div>
          <LinkButton href="/care" className={styles.secondaryAction}>
            Попробовать на своём запросе <ArrowRight aria-hidden="true" />
          </LinkButton>
        </Reveal>
      </section>

      <section className={styles.memory} aria-labelledby="memory-title">
        <Reveal className={styles.memoryCopy}>
          <p className={styles.eyebrow}>YOUR BEAUTY MEMORY</p>
          <h2 id="memory-title">
            Полезное остаётся.
            <br />
            <em>Шум — нет.</em>
          </h2>
          <p>
            Избранное, история подборов и ваши материалы живут в одном пространстве. Только то, к
            чему действительно хочется вернуться.
          </p>
          <LinkButton href="/profile" className={styles.memoryAction}>
            <UserRound aria-hidden="true" /> Открыть профиль
          </LinkButton>
        </Reveal>

        <Reveal className={styles.memoryScene} delay={0.08}>
          <div className={styles.memoryHalo} aria-hidden="true" />
          <motion.article
            className={styles.memoryCard}
            whileHover={reduceMotion ? undefined : { y: -7, rotate: -1.2 }}
          >
            <Heart />
            <span>01</span>
            <strong>Избранное</strong>
            <p>Средства, к которым хочется вернуться.</p>
          </motion.article>
          <motion.article
            className={styles.memoryCard}
            whileHover={reduceMotion ? undefined : { y: -7, rotate: 1 }}
          >
            <History />
            <span>02</span>
            <strong>История</strong>
            <p>Контекст прошлых решений без повторного старта.</p>
          </motion.article>
          <motion.article
            className={styles.memoryCard}
            whileHover={reduceMotion ? undefined : { y: -7, rotate: -0.7 }}
          >
            <Sparkles />
            <span>03</span>
            <strong>Публикации</strong>
            <p>Собственные статьи и живой опыт сообщества.</p>
          </motion.article>
        </Reveal>
      </section>

      <section className={styles.community} aria-labelledby="community-title">
        <Reveal>
          <p className={styles.eyebrow}>ГДЕ ВАМ УДОБНО</p>
          <h2 id="community-title">Красавица — рядом.</h2>
          <span>Подбор в боте, новости проекта и визуальные материалы.</span>
        </Reveal>
        <Reveal className={styles.communityGrid} delay={0.08}>
          <CommunityLink href="https://t.me/krasavitsa_ai_bot" label="Telegram-бот">
            <Bot />
          </CommunityLink>
          <CommunityLink href="https://t.me/krasavitsa_ai" label="Telegram">
            <Send />
          </CommunityLink>
          <CommunityLink
            href="https://www.instagram.com/krasavitsa_ai?utm_source=qr"
            label="Instagram"
          >
            <InstagramIcon />
          </CommunityLink>
          <CommunityLink href="https://vk.ru/krasavitsa_ai" label="VK">
            <VkIcon />
          </CommunityLink>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0.42, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px 0px" }}
      transition={{ duration: 0.68, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function CommunityLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={styles.communityLink}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
    >
      <span>{children}</span>
      <strong>{label}</strong>
      <ArrowUpRight aria-hidden="true" />
    </motion.a>
  );
}
