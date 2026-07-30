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
import { useRef } from "react";
import { DigitalLotus } from "@/components/digital-lotus";
import { HeroRibbonField } from "@/components/hero-ribbon-field";
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
  const smoothX = useSpring(pointerX, { stiffness: 82, damping: 24, mass: 0.72 });
  const smoothY = useSpring(pointerY, { stiffness: 82, damping: 24, mass: 0.72 });
  const mediaX = useTransform(smoothX, (value) => value * -0.7);
  const mediaY = useTransform(smoothY, (value) => value * -0.54);
  const typeX = useTransform(smoothX, (value) => value * 0.2);

  const { scrollYProgress: rawProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });
  const heroProgress = useSpring(rawProgress, { stiffness: 94, damping: 28, mass: 0.34 });

  const sceneScale = useTransform(heroProgress, [0, 0.42, 0.82, 1], [1, 1, 1.025, 0.965]);
  const sceneRadius = useTransform(heroProgress, [0, 0.66, 1], [0, 0, 36]);
  const backdropScale = useTransform(heroProgress, [0, 0.46, 0.84], [1.02, 1.11, 1.58]);
  const backdropRotate = useTransform(heroProgress, [0, 0.52, 0.86], [0, -2.2, 8]);
  const backdropOpacity = useTransform(heroProgress, [0, 0.63, 0.9], [1, 0.9, 0]);
  const lotusScale = useTransform(heroProgress, [0, 0.18, 0.48, 0.73], [0.7, 0.86, 1.03, 1.38]);
  const lotusRotate = useTransform(heroProgress, [0, 0.46, 0.76], [-2, 2, -7]);
  const lotusOpacity = useTransform(heroProgress, [0, 0.69, 0.88], [1, 1, 0]);
  const lotusBloom = useTransform(heroProgress, [0, 0.14, 0.42, 0.58], [0.12, 0.26, 0.72, 1]);
  const scatterLeftFar = useTransform(heroProgress, [0.48, 0.82], ["0vw", "-74vw"]);
  const scatterLeft = useTransform(heroProgress, [0.48, 0.82], ["0vw", "-52vw"]);
  const scatterRight = useTransform(heroProgress, [0.48, 0.82], ["0vw", "52vw"]);
  const scatterRightFar = useTransform(heroProgress, [0.48, 0.82], ["0vw", "74vw"]);
  const scatterUpFar = useTransform(heroProgress, [0.48, 0.82], ["0vh", "-72vh"]);
  const scatterUp = useTransform(heroProgress, [0.48, 0.82], ["0vh", "-46vh"]);
  const scatterDown = useTransform(heroProgress, [0.48, 0.82], ["0vh", "44vh"]);
  const introY = useTransform(heroProgress, [0, 0.3, 0.55], [0, -12, -84]);
  const introScale = useTransform(heroProgress, [0, 0.36, 0.58], [1, 0.98, 0.86]);
  const introOpacity = useTransform(heroProgress, [0, 0.34, 0.6], [1, 0.88, 0]);
  const detailOpacity = useTransform(heroProgress, [0, 0.22, 0.49], [1, 0.82, 0]);
  const aperture = useTransform(
    heroProgress,
    [0.49, 0.78, 1],
    ["circle(0% at 50% 54%)", "circle(76% at 50% 54%)", "circle(150% at 50% 54%)"],
  );
  const revealScale = useTransform(heroProgress, [0.49, 0.8, 1], [0.86, 0.98, 1]);
  const revealOpacity = useTransform(heroProgress, [0.5, 0.66, 1], [0, 0.88, 1]);
  const revealCopyY = useTransform(heroProgress, [0.58, 0.84, 1], [92, 8, 0]);

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
          pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 30);
          pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 24);
        }}
        onPointerLeave={() => {
          pointerX.set(0);
          pointerY.set(0);
        }}
      >
        <div className={styles.heroSticky}>
          <motion.div
            className={styles.heroScene}
            style={reduceMotion ? undefined : { scale: sceneScale, borderRadius: sceneRadius }}
          >
            <motion.div
              className={styles.motionField}
              style={reduceMotion ? undefined : { x: mediaX, y: mediaY }}
              aria-hidden="true"
            >
              <video
                className={styles.ambientFilm}
                src="/krasavitsa-beauty-loop-source.mp4"
                muted
                autoPlay
                loop
                playsInline
                preload="metadata"
                tabIndex={-1}
              />
              <motion.div
                className={styles.ribbonField}
                style={reduceMotion
                  ? undefined
                  : { scale: backdropScale, rotate: backdropRotate, opacity: backdropOpacity }}
              >
                <HeroRibbonField />
              </motion.div>
              <div className={styles.spectralVeil} />
              <div className={styles.axisGrid} />
            </motion.div>

            <motion.div
              className={styles.glassLotus}
              style={reduceMotion
                ? ({ "--lotus-bloom": 1 } as never)
                : ({
                    scale: lotusScale,
                    rotate: lotusRotate,
                    opacity: lotusOpacity,
                    "--lotus-bloom": lotusBloom,
                    "--scatter-left-far": scatterLeftFar,
                    "--scatter-left": scatterLeft,
                    "--scatter-right": scatterRight,
                    "--scatter-right-far": scatterRightFar,
                    "--scatter-up-far": scatterUpFar,
                    "--scatter-up": scatterUp,
                    "--scatter-down": scatterDown,
                  } as never)}
              aria-hidden="true"
            >
              <DigitalLotus className={styles.lotusObject} />
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
              style={reduceMotion ? undefined : { opacity: detailOpacity }}
            >
              <p>Точный выбор без лишнего шума.</p>
              <LinkButton href="/care" className={styles.primaryAction} data-analytics="hero_search">
                Начать подбор <ArrowRight aria-hidden="true" />
              </LinkButton>
            </motion.div>

            <motion.div
              className={styles.apertureReveal}
              style={reduceMotion
                ? undefined
                : { clipPath: aperture, scale: revealScale, opacity: revealOpacity }}
              aria-hidden={reduceMotion ? true : undefined}
            >
              <motion.div
                className={styles.apertureCopy}
                style={reduceMotion ? undefined : { y: revealCopyY }}
              >
                <span>01 · ЗАПРОС СТАНОВИТСЯ СИСТЕМОЙ</span>
                <strong>Красота начинается с вопроса.</strong>
                <p>Три направления. Одна ясная логика выбора.</p>
              </motion.div>
              <div className={styles.apertureSignal} aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className={styles.directions} id="directions" aria-labelledby="directions-title">
        <div className={styles.sectionHeading}>
          <p>ТРИ РЕЖИМА · ОДНА ЛОГИКА</p>
          <h2 id="directions-title">
            Выберите задачу.
            <br />
            <em>Остальное уточним.</em>
          </h2>
          <span>
            Интерфейс задаст только нужные вопросы и не смешает правила кожи, волос и парфюмерии.
          </span>
        </div>
        <div className={styles.directionGrid}>
          {directions.map(({ label, number, text, note, Icon }, order) => (
            <motion.div
              key={label}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.64, delay: order * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/care" className={styles.directionCard}>
                <span className={styles.directionNumber}>{number}</span>
                <span className={styles.directionIcon}>
                  <Icon aria-hidden="true" />
                </span>
                <strong>{label}</strong>
                <p>{text}</p>
                <small>{note}</small>
                <ArrowUpRight className={styles.cardArrow} aria-hidden="true" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className={styles.intelligence} aria-labelledby="intelligence-title">
        <div className={styles.signalCanvas} aria-label="Схема формирования рекомендации">
          <motion.div
            className={styles.queryNode}
            initial={reduceMotion ? undefined : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-120px" }}
          >
            <span>Ваш запрос</span>
            <strong>«Нужен мягкий уход без перегруза»</strong>
          </motion.div>
          <div className={styles.signalRail} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className={styles.verificationNodes}>
            <motion.span
              initial={reduceMotion ? undefined : { scale: 0.7, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
            >
              <Check /> состав
            </motion.span>
            <motion.span
              initial={reduceMotion ? undefined : { scale: 0.7, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Check /> наличие
            </motion.span>
            <motion.span
              initial={reduceMotion ? undefined : { scale: 0.7, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Check /> роль
            </motion.span>
          </div>
          <motion.div
            className={styles.resultPreview}
            initial={reduceMotion ? undefined : { opacity: 0, x: 34, rotate: 2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <span>Сценарий готов</span>
            <strong>3 шага · 4 средства</strong>
            <div>
              <i />
              <i />
              <i />
            </div>
          </motion.div>
        </div>

        <div className={styles.intelligenceCopy}>
          <p className={styles.eyebrow}>HOW IT THINKS / 03 STEPS</p>
          <h2 id="intelligence-title">
            Из запроса —
            <br />
            <em>в ясный сценарий.</em>
          </h2>
          <div className={styles.processList}>
            {process.map(({ title, text, metric }, index) => (
              <motion.article
                key={title}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-64px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <small>{metric}</small>
              </motion.article>
            ))}
          </div>
          <LinkButton href="/care" className={styles.secondaryAction}>
            Попробовать на своём запросе <ArrowRight aria-hidden="true" />
          </LinkButton>
        </div>
      </section>

      <section className={styles.memory} aria-labelledby="memory-title">
        <div className={styles.memoryCopy}>
          <p className={styles.eyebrow}>YOUR BEAUTY MEMORY</p>
          <h2 id="memory-title">
            Полезное остаётся.
            <br />
            <em>Шум — нет.</em>
          </h2>
          <p>
            Избранное, история подборов и ваши материалы живут в одном пространстве. Только то,
            к чему действительно хочется вернуться.
          </p>
          <LinkButton href="/profile" className={styles.memoryAction}>
            <UserRound aria-hidden="true" /> Открыть профиль
          </LinkButton>
        </div>
        <div className={styles.memoryScene}>
          <div className={styles.memoryHalo} aria-hidden="true" />
          <motion.article
            className={styles.memoryCard}
            whileHover={reduceMotion ? undefined : { y: -8, rotate: -1.6 }}
          >
            <Heart />
            <span>01</span>
            <strong>Избранное</strong>
            <p>Средства, к которым хочется вернуться.</p>
          </motion.article>
          <motion.article
            className={styles.memoryCard}
            whileHover={reduceMotion ? undefined : { y: -8, rotate: 1.2 }}
          >
            <History />
            <span>02</span>
            <strong>История</strong>
            <p>Контекст прошлых решений без повторного старта.</p>
          </motion.article>
          <motion.article
            className={styles.memoryCard}
            whileHover={reduceMotion ? undefined : { y: -8, rotate: -0.8 }}
          >
            <Sparkles />
            <span>03</span>
            <strong>Публикации</strong>
            <p>Собственные статьи и живой опыт сообщества.</p>
          </motion.article>
        </div>
      </section>

      <section className={styles.community} aria-labelledby="community-title">
        <div>
          <p className={styles.eyebrow}>ГДЕ ВАМ УДОБНО</p>
          <h2 id="community-title">Красавица — рядом.</h2>
          <span>Подбор в боте, новости проекта и визуальные материалы.</span>
        </div>
        <div className={styles.communityGrid}>
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
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function CommunityLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={styles.communityLink}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
    >
      <span>{children}</span>
      <strong>{label}</strong>
      <ArrowUpRight aria-hidden="true" />
    </motion.a>
  );
}
