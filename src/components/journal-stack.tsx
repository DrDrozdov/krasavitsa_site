"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  PenLine,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "./journal-stack.module.css";

type JournalIssue = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  image: string;
  body?: string[];
};

type SpineStyle = CSSProperties & {
  "--issue-order": number;
  "--spine-width": string;
  "--spine-drop": string;
};

const cx = (...names: Array<string | false | undefined>) =>
  names.filter(Boolean).join(" ");

const shelfVariants = {
  hidden: {
    opacity: 0,
    transform: "translate3d(0, 34px, 0) rotateX(4deg)",
  },
  visible: {
    opacity: 1,
    transform: "translate3d(0, 0, 0) rotateX(0deg)",
    transition: {
      duration: 0.72,
      ease: [0.16, 1, 0.3, 1] as const,
      staggerChildren: 0.045,
    },
  },
};

const spineVariants = {
  hidden: {
    opacity: 0,
    transform: "translate3d(0, 22px, 0)",
  },
  visible: {
    opacity: 1,
    transform: "translate3d(0, 0, 0)",
    transition: {
      duration: 0.48,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const revealTransition = {
  duration: 0.62,
  ease: [0.16, 1, 0.3, 1] as const,
};

const spineWidths = ["72px", "62px", "78px", "68px", "82px", "64px", "74px", "66px"];
const spineDrops = ["0px", "12px", "5px", "18px", "2px", "14px", "8px", "20px"];

export function JournalStack({ posts }: { posts: JournalIssue[] }) {
  const stageRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string>();
  const issues = posts.slice(0, 8);
  const activeIssue = issues.find((issue) => issue.slug === activeSlug);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!activeIssue) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());

    body.style.overflow = "hidden";
    if (scrollbarGap > 0) {
      body.style.paddingRight = `${scrollbarGap}px`;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveSlug(undefined);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", closeOnEscape);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      window.requestAnimationFrame(() => openerRef.current?.focus());
    };
  }, [activeIssue]);

  const openIssue = (
    slug: string,
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    openerRef.current = event.currentTarget;
    setActiveSlug(slug);
  };

  const closeIssue = () => setActiveSlug(undefined);

  const keepFocusInside = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !readerRef.current) return;

    const focusable = Array.from(
      readerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const scrollToEditor = () => {
    document.getElementById("write")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <LayoutGroup id="journal-shelf">
      <section
        ref={stageRef}
        className={styles.stage}
        aria-labelledby="journal-press-title"
      >
        <div className={styles.atmosphere} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className={styles.frame}>
          <motion.header
            className={styles.intro}
            initial={
              reduceMotion
                ? false
                : { opacity: 0, transform: "translate3d(0, 24px, 0)" }
            }
            whileInView={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
            viewport={{ once: true, amount: 0.45 }}
            transition={revealTransition}
          >
            <span className={styles.kicker}>KRASAVITSA JOURNAL</span>
            <h1 id="journal-press-title">
              Красота
              <br />
              без шума.
            </h1>
            <p>
              Практичные тексты об уходе, составах и ароматах. Открывайте выпуск
              с полки и читайте в своём темпе.
            </p>
            <button
              type="button"
              className={styles.editorLink}
              onClick={scrollToEditor}
            >
              <PenLine aria-hidden="true" />
              Создать статью
              <ArrowRight aria-hidden="true" />
            </button>
          </motion.header>

          <motion.div
            className={styles.press}
            variants={reduceMotion ? undefined : shelfVariants}
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "visible"}
            viewport={{ once: true, amount: 0.28 }}
            aria-label="Полка свежих выпусков журнала"
          >
            <div className={styles.pressHeader}>
              <span>Редакционная полка</span>
              <span>{String(issues.length).padStart(2, "0")} выпусков</span>
            </div>

            <div className={styles.shelf}>
              <div className={styles.spines}>
                {issues.map((post, index) => (
                  <JournalSpine
                    key={post.slug}
                    post={post}
                    index={index}
                    active={activeSlug === post.slug}
                    reduceMotion={Boolean(reduceMotion)}
                    onOpen={(event) => openIssue(post.slug, event)}
                  />
                ))}
              </div>
              <div className={styles.shelfLip} aria-hidden="true">
                <span />
              </div>
            </div>

            <p className={styles.instruction}>
              <BookOpenText aria-hidden="true" />
              Выберите корешок, чтобы развернуть выпуск
            </p>
          </motion.div>
        </div>

        <p className={styles.liveStatus} aria-live="polite">
          {activeIssue ? `Открыт материал «${activeIssue.title}»` : ""}
        </p>

        {mounted
          ? createPortal(
              <AnimatePresence initial={false}>
          {activeIssue ? (
            <motion.div
              ref={readerRef}
              className={styles.readerOverlay}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`reader-title-${activeIssue.slug}`}
              aria-describedby={`reader-excerpt-${activeIssue.slug}`}
              onKeyDown={keepFocusInside}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.2 }}
            >
              <button
                type="button"
                className={styles.readerBackdrop}
                aria-label="Закрыть выпуск"
                onClick={closeIssue}
              />

              <motion.section
                className={styles.reader}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        transform: "translate3d(0, 18px, 0) scale(0.99)",
                      }
                }
                animate={{
                  opacity: 1,
                  transform: "translate3d(0, 0, 0) scale(1)",
                }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        transform: "translate3d(0, 10px, 0) scale(0.995)",
                      }
                }
                transition={{
                  duration: reduceMotion ? 0.12 : 0.52,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className={styles.readerCoverPane}>
                  <motion.figure
                    layoutId={`journal-issue-${activeIssue.slug}`}
                    className={styles.readerCover}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            duration: 0.62,
                            bounce: 0.08,
                          }
                    }
                  >
                    <Image
                      src={activeIssue.image}
                      alt=""
                      fill
                      fetchPriority="high"
                      sizes="(max-width: 780px) 100vw, 42vw"
                    />
                    <span className={styles.coverWash} aria-hidden="true" />
                    <figcaption className={styles.coverContent}>
                      <span>
                        {activeIssue.category} / {activeIssue.readTime}
                      </span>
                      <strong>{activeIssue.title}</strong>
                      <small>Красавица</small>
                    </figcaption>
                    <span className={styles.coverFold} aria-hidden="true" />
                  </motion.figure>

                  <div className={styles.readerTools}>
                    <span>Выпуск {String(issues.indexOf(activeIssue) + 1).padStart(2, "0")}</span>
                    <Link href={`/blog/${activeIssue.slug}`}>
                      Отдельная страница
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <div className={styles.readerStory}>
                  <div className={styles.readerTopbar}>
                    <span>KRASAVITSA JOURNAL</span>
                    <button
                      ref={closeRef}
                      type="button"
                      onClick={closeIssue}
                      aria-label="Закрыть выпуск"
                    >
                      <X aria-hidden="true" />
                    </button>
                  </div>

                  <article className={styles.readerArticle}>
                    <RevealBlock reduceMotion={Boolean(reduceMotion)}>
                      <p className={styles.readerMeta}>
                        {activeIssue.category}
                        <span aria-hidden="true" />
                        {activeIssue.readTime}
                      </p>
                      <h2 id={`reader-title-${activeIssue.slug}`}>
                        {activeIssue.title}
                      </h2>
                      <strong id={`reader-excerpt-${activeIssue.slug}`}>
                        {activeIssue.excerpt}
                      </strong>
                    </RevealBlock>

                    <div className={styles.readerCopy}>
                      {(activeIssue.body?.length
                        ? activeIssue.body
                        : [activeIssue.excerpt]
                      ).map((paragraph, index) =>
                        index === 1 ? (
                          <RevealBlock
                            key={`${activeIssue.slug}-${index}`}
                            reduceMotion={Boolean(reduceMotion)}
                            delay={0.02}
                          >
                            <blockquote>{paragraph}</blockquote>
                          </RevealBlock>
                        ) : (
                          <RevealBlock
                            key={`${activeIssue.slug}-${index}`}
                            reduceMotion={Boolean(reduceMotion)}
                            delay={0.02}
                          >
                            <p>{paragraph}</p>
                          </RevealBlock>
                        ),
                      )}
                    </div>

                    <RevealBlock reduceMotion={Boolean(reduceMotion)}>
                      <footer className={styles.readerFooter}>
                        <span>Материал подготовлен редакцией Красавицы</span>
                        <p>
                          Текст носит информационный характер и не заменяет
                          консультацию специалиста.
                        </p>
                        <Link href={`/blog/${activeIssue.slug}`}>
                          Читать и сохранить
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      </footer>
                    </RevealBlock>
                  </article>
                </div>
              </motion.section>
            </motion.div>
          ) : null}
              </AnimatePresence>,
              document.body,
            )
          : null}
      </section>
    </LayoutGroup>
  );
}

function JournalSpine({
  post,
  index,
  active,
  reduceMotion,
  onOpen,
}: {
  post: JournalIssue;
  index: number;
  active: boolean;
  reduceMotion: boolean;
  onOpen: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  const issueNumber = String(index + 1).padStart(2, "0");
  const titleId = `journal-spine-title-${post.slug}`;
  const style: SpineStyle = {
    "--issue-order": index,
    "--spine-width": spineWidths[index % spineWidths.length],
    "--spine-drop": spineDrops[index % spineDrops.length],
  };

  return (
    <motion.button
      type="button"
      layoutId={`journal-issue-${post.slug}`}
      variants={reduceMotion ? undefined : spineVariants}
      className={cx(
        styles.spine,
        styles[`tone${(index % 8) + 1}`],
        active && styles.activeSpine,
      )}
      style={style}
      onClick={onOpen}
      aria-labelledby={titleId}
      aria-haspopup="dialog"
      aria-expanded={active}
      aria-controls={active ? `reader-title-${post.slug}` : undefined}
    >
      <span className={styles.spineHead} aria-hidden="true">
        <span>{issueNumber}</span>
        <small>{post.category}</small>
      </span>
      <span id={titleId} className={styles.spineTitle}>
        {post.title}
      </span>
      <span className={styles.spineFoot} aria-hidden="true">
        <small>КРАСАВИЦА</small>
        <ArrowUpRight />
      </span>
      <span className={styles.spineHinge} aria-hidden="true" />
      <span className={styles.spineForeEdge} aria-hidden="true" />
    </motion.button>
  );
}

function RevealBlock({
  children,
  reduceMotion,
  delay = 0,
}: {
  children: React.ReactNode;
  reduceMotion: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      className={styles.reveal}
      initial={
        reduceMotion
          ? false
          : { opacity: 0, transform: "translate3d(0, 22px, 0)" }
      }
      whileInView={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: reduceMotion ? 0.12 : 0.58,
        delay: reduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
