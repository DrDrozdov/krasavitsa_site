"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, PenLine } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import styles from "./journal-stack.module.css";

type JournalIssue = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  image: string;
};

const cx = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");

export function JournalStack({ posts }: { posts: JournalIssue[] }) {
  const stageRef = useRef<HTMLElement>(null);
  const navigationTimerRef = useRef<number | null>(null);
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [openingSlug, setOpeningSlug] = useState<string>();
  const issues = posts.slice(0, 7);
  const openingIssue = issues.find((issue) => issue.slug === openingSlug);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start end", "end start"],
  });
  const shelfY = useTransform(scrollYProgress, [0, 0.42, 1], [54, 0, -28]);
  const shelfRotate = useTransform(scrollYProgress, [0, 0.5, 1], [3.5, 0, -1.5]);
  const copyY = useTransform(scrollYProgress, [0, 0.58, 1], [22, 0, -32]);

  useEffect(
    () => () => {
      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current);
      }
    },
    [],
  );

  const openIssue = (slug: string) => {
    if (openingSlug) return;
    setOpeningSlug(slug);

    if (reduceMotion) {
      router.push(`/blog/${slug}`);
      return;
    }

    navigationTimerRef.current = window.setTimeout(() => {
      router.push(`/blog/${slug}`);
    }, 760);
  };

  const scrollToEditor = () => {
    document.getElementById("write")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <LayoutGroup id="journal-shelf">
      <section ref={stageRef} className={styles.stage} aria-labelledby="journal-press-title">
        <div className={styles.atmosphere} aria-hidden="true">
          <span />
          <span />
        </div>

        <div className={styles.frame}>
          <motion.header
            className={styles.intro}
            style={reduceMotion ? undefined : { y: copyY }}
          >
            <span className={styles.kicker}>KRASAVITSA JOURNAL</span>
            <h1 id="journal-press-title">
              Истории,
              <br />
              которые остаются.
            </h1>
            <p>
              Уход, ароматы и личный опыт — в материалах, к которым хочется
              возвращаться.
            </p>
            <button type="button" className={styles.editorLink} onClick={scrollToEditor}>
              <PenLine aria-hidden="true" />
              Создать статью
              <ArrowRight aria-hidden="true" />
            </button>
          </motion.header>

          <motion.div
            className={styles.shelf}
            style={reduceMotion ? undefined : { y: shelfY, rotateX: shelfRotate }}
            aria-label="Свежие материалы журнала"
          >
            <div className={styles.shelfTop} aria-hidden="true">
              <span>Коллекция / {String(issues.length).padStart(2, "0")}</span>
              <span>Выберите корешок</span>
            </div>

            <div className={styles.spines}>
              {issues.map((post, index) => (
                <JournalSpine
                  key={post.slug}
                  post={post}
                  index={index}
                  opening={openingSlug === post.slug}
                  disabled={Boolean(openingSlug)}
                  reduceMotion={Boolean(reduceMotion)}
                  onOpen={() => openIssue(post.slug)}
                />
              ))}

              {issues.length < 5 && (
                <button type="button" className={styles.writeSpine} onClick={scrollToEditor}>
                  <span>Ваш материал</span>
                  <strong>Создать собственную историю</strong>
                  <PenLine aria-hidden="true" />
                </button>
              )}
            </div>

            <div className={styles.shelfBase} aria-hidden="true" />
          </motion.div>
        </div>

        <p className={styles.instruction}>
          <span>Нажмите на корешок, чтобы открыть материал</span>
          <ArrowUpRight aria-hidden="true" />
        </p>

        <p className={styles.liveStatus} aria-live="polite">
          {openingIssue ? `Открываем материал «${openingIssue.title}»` : ""}
        </p>

        <AnimatePresence>
          {openingIssue && !reduceMotion && (
            <motion.div
              className={styles.openingLayer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              aria-hidden="true"
            >
              <motion.article
                layoutId={`journal-issue-${openingIssue.slug}`}
                className={styles.openingCover}
                transition={{ type: "spring", stiffness: 210, damping: 26, mass: 0.9 }}
              >
                <Image
                  src={openingIssue.image}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 900px) 38vw, 78vw"
                />
                <span className={styles.coverWash} />
                <span className={styles.coverContent}>
                  <small>{openingIssue.category} · {openingIssue.readTime}</small>
                  <strong>{openingIssue.title}</strong>
                  <span>{openingIssue.excerpt}</span>
                </span>
                <ArrowUpRight className={styles.coverArrow} />
              </motion.article>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </LayoutGroup>
  );
}

function JournalSpine({
  post,
  index,
  opening,
  disabled,
  reduceMotion,
  onOpen,
}: {
  post: JournalIssue;
  index: number;
  opening: boolean;
  disabled: boolean;
  reduceMotion: boolean;
  onOpen: () => void;
}) {
  const issueNumber = String(index + 1).padStart(2, "0");
  const titleId = `journal-spine-title-${post.slug}`;
  const metaId = `journal-spine-meta-${post.slug}`;

  return (
    <motion.button
      type="button"
      layoutId={`journal-issue-${post.slug}`}
      className={cx(styles.spine, styles[`tone${(index % 6) + 1}`], opening && styles.opening)}
      whileHover={
        reduceMotion || disabled
          ? undefined
          : { x: -18, rotateY: -3.5, scale: 1.018 }
      }
      whileFocus={
        reduceMotion || disabled
          ? undefined
          : { x: -12, rotateY: -2, scale: 1.012 }
      }
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.992 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      disabled={disabled && !opening}
      onClick={onOpen}
      aria-labelledby={`${titleId} ${metaId}`}
      aria-expanded={opening}
    >
      <span className={styles.spineIndex} aria-hidden="true">{issueNumber}</span>
      <span className={styles.spineRule} aria-hidden="true" />
      <span id={titleId} className={styles.spineTitle}>{post.title}</span>
      <span id={metaId} className={styles.spineMeta}>
        {post.category}
        <i aria-hidden="true" />
        {post.readTime}
      </span>
      <ArrowUpRight className={styles.spineArrow} aria-hidden="true" />
      <span className={styles.spineSheen} aria-hidden="true" />
    </motion.button>
  );
}
