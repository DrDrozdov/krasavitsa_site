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
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal, flushSync } from "react-dom";
import styles from "./journal-stack.module.css";

type JournalIssue = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  image: string;
  body?: string[];
  publishedAt?: string;
  popularity?: number;
};

type FilterKey = "for-you" | "new" | "popular" | `topic:${string}`;

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

type SpineStyle = CSSProperties & {
  "--issue-order": number;
  "--spine-height": string;
  "--spine-shift": string;
  viewTransitionName?: string;
};

type CoverStyle = CSSProperties & { viewTransitionName?: string };

const ease = [0.16, 1, 0.3, 1] as const;
const spineHeights = ["52px", "46px", "57px", "49px", "55px", "44px"];
const spineShifts = ["0px", "12px", "4px", "18px", "8px", "2px"];

const cx = (...names: Array<string | false | undefined>) =>
  names.filter(Boolean).join(" ");

function issueTimestamp(issue: JournalIssue, index: number) {
  const parsed = issue.publishedAt ? Date.parse(issue.publishedAt) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : Date.UTC(2026, 6, 24 - index);
}

function issuePopularity(issue: JournalIssue, index: number) {
  if (typeof issue.popularity === "number") return issue.popularity;
  const titleSignal = Array.from(issue.title).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return 58 + ((titleSignal + index * 17) % 39);
}

function rankForYou(issues: JournalIssue[]) {
  const newest = Math.max(
    ...issues.map((issue, index) => issueTimestamp(issue, index)),
  );
  const day = 86_400_000;
  const ranked = issues
    .map((issue, index) => {
      const age = Math.max(0, (newest - issueTimestamp(issue, index)) / day);
      const recency = Math.max(0, 100 - age * 4.5);
      const score = issuePopularity(issue, index) * 0.62 + recency * 0.38;
      return { issue, score };
    })
    .sort((a, b) => b.score - a.score);

  const diverse: typeof ranked = [];
  const usedTopics = new Set<string>();
  for (const candidate of ranked) {
    if (!usedTopics.has(candidate.issue.category)) {
      diverse.push(candidate);
      usedTopics.add(candidate.issue.category);
    }
  }
  for (const candidate of ranked) {
    if (!diverse.includes(candidate)) diverse.push(candidate);
  }
  return diverse.map(({ issue }) => issue);
}

function filterIssues(posts: JournalIssue[], filter: FilterKey) {
  if (filter === "new") {
    return [...posts].sort(
      (a, b) =>
        issueTimestamp(b, posts.indexOf(b)) -
        issueTimestamp(a, posts.indexOf(a)),
    );
  }
  if (filter === "popular") {
    return [...posts].sort(
      (a, b) =>
        issuePopularity(b, posts.indexOf(b)) -
        issuePopularity(a, posts.indexOf(a)),
    );
  }
  if (filter.startsWith("topic:")) {
    const topic = filter.slice("topic:".length);
    return posts.filter((post) => post.category === topic);
  }
  return rankForYou(posts);
}

export function JournalStack({ posts }: { posts: JournalIssue[] }) {
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [supportsViewTransition, setSupportsViewTransition] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string>();
  const [returnSlug, setReturnSlug] = useState<string>();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("for-you");

  const categories = useMemo(
    () => [...new Set(posts.map((post) => post.category))],
    [posts],
  );
  const issues = useMemo(
    () => filterIssues(posts, activeFilter),
    [activeFilter, posts],
  );
  const activeIssue = posts.find((issue) => issue.slug === activeSlug);

  const filters = useMemo(
    () => [
      { key: "for-you" as const, label: "Для вас" },
      { key: "new" as const, label: "Новое" },
      { key: "popular" as const, label: "Читают" },
      ...categories.map((category) => ({
        key: `topic:${category}` as FilterKey,
        label: category,
      })),
    ],
    [categories],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
      setSupportsViewTransition(
        typeof (document as ViewTransitionDocument).startViewTransition ===
          "function",
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const closeIssue = useCallback(() => {
    if (!activeSlug) return;
    const slug = activeSlug;
    const transitionDocument = document as ViewTransitionDocument;
    if (!reduceMotion && transitionDocument.startViewTransition) {
      const transition = transitionDocument.startViewTransition(() => {
        flushSync(() => {
          setReturnSlug(slug);
          setActiveSlug(undefined);
        });
      });
      transition.finished.finally(() => setReturnSlug(undefined));
      return;
    }
    setActiveSlug(undefined);
  }, [activeSlug, reduceMotion]);

  useEffect(() => {
    if (!activeIssue) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());

    body.style.overflow = "hidden";
    if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeIssue();
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", closeOnEscape);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      window.requestAnimationFrame(() => openerRef.current?.focus());
    };
  }, [activeIssue, closeIssue]);

  const openIssue = (
    slug: string,
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    openerRef.current = event.currentTarget;
    if (reduceMotion) {
      setActiveSlug(slug);
      return;
    }

    const transitionDocument = document as ViewTransitionDocument;
    if (transitionDocument.startViewTransition) {
      event.currentTarget.style.viewTransitionName = "journal-active-issue";
      const transition = transitionDocument.startViewTransition(() => {
        flushSync(() => setActiveSlug(slug));
      });
      transition.finished.finally(() => {
        if (openerRef.current) openerRef.current.style.viewTransitionName = "";
      });
      return;
    }
    setActiveSlug(slug);
  };

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

  const filterNote =
    activeFilter === "for-you"
      ? "Свежесть, интерес читателей и разнообразие тем — без профилирования."
      : activeFilter === "new"
        ? "Сначала последние опубликованные материалы."
        : activeFilter === "popular"
          ? "Материалы, к которым чаще возвращаются читатели."
          : `Все материалы по теме «${activeFilter.slice("topic:".length)}».`;

  return (
    <LayoutGroup id="journal-library">
      <section
        id="journal-library"
        className={styles.stage}
        aria-labelledby="journal-press-title"
      >
        <div className={styles.atmosphere} aria-hidden="true" />
        <div className={styles.frame}>
          <motion.header
            className={styles.intro}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.68, ease }}
          >
            <span className={styles.kicker}>Krasavitsa Journal</span>
            <h1 id="journal-press-title">Идеи, к которым возвращаются.</h1>
            <p>
              Практичные тексты об уходе, составах, волосах и ароматах — без
              тревожной ленты и рекламного шума.
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
            initial={reduceMotion ? false : { opacity: 0, y: 32, rotateX: 3 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.78, ease }}
          >
            <div className={styles.pressHeader}>
              <div>
                <span>Полка журнала</span>
                <strong>{String(issues.length).padStart(2, "0")}</strong>
              </div>
              <p>{filterNote}</p>
            </div>

            <nav className={styles.filters} aria-label="Фильтры журнала">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  aria-pressed={activeFilter === filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label}
                </button>
              ))}
            </nav>

            <div className={styles.shelf}>
              <div className={styles.shelfTop} aria-hidden="true" />
              <motion.div
                className={styles.spines}
                layout={!reduceMotion}
                aria-label="Корешки выпусков журнала"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {issues.map((post, index) => (
                    <JournalSpine
                      key={post.slug}
                      post={post}
                      index={index}
                      active={activeSlug === post.slug}
                      returning={returnSlug === post.slug}
                      supportsViewTransition={supportsViewTransition}
                      reduceMotion={Boolean(reduceMotion)}
                      onOpen={(event) => openIssue(post.slug, event)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
              <div className={styles.shelfBase} aria-hidden="true" />
            </div>

            <p className={styles.instruction}>
              <BookOpenText aria-hidden="true" />
              Выберите корешок — он развернётся в выпуск
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
                    transition={{ duration: reduceMotion ? 0.1 : 0.22 }}
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
                          : { opacity: 0, y: 16, scale: 0.992 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 8, scale: 0.996 }
                      }
                      transition={{
                        duration: reduceMotion ? 0.1 : 0.52,
                        ease,
                      }}
                    >
                      <div className={styles.readerCoverPane}>
                        <motion.figure
                          layoutId={
                            supportsViewTransition
                              ? undefined
                              : `journal-issue-${activeIssue.slug}`
                          }
                          style={
                            {
                              viewTransitionName: reduceMotion
                                ? undefined
                                : "journal-active-issue",
                            } as CoverStyle
                          }
                          className={styles.readerCover}
                          transition={{
                            type: "spring",
                            duration: reduceMotion ? 0 : 0.7,
                            bounce: 0,
                          }}
                        >
                          <Image
                            src={activeIssue.image}
                            alt=""
                            fill
                            fetchPriority="high"
                            sizes="(max-width: 760px) 82vw, 38vw"
                          />
                          <span className={styles.coverWash} aria-hidden="true" />
                          <figcaption className={styles.coverContent}>
                            <span>
                              {activeIssue.category} / {activeIssue.readTime}
                            </span>
                            <strong>{activeIssue.title}</strong>
                            <small>Krasavitsa Journal</small>
                          </figcaption>
                          <span className={styles.coverSheen} aria-hidden="true" />
                        </motion.figure>

                        <div className={styles.readerTools}>
                          <span>Журнал · {activeIssue.category}</span>
                          <Link href={`/blog/${activeIssue.slug}`}>
                            На отдельной странице
                            <ArrowUpRight aria-hidden="true" />
                          </Link>
                        </div>
                      </div>

                      <motion.div
                        className={styles.readerStory}
                        initial={reduceMotion ? false : { opacity: 0, x: 42 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: reduceMotion ? 0.1 : 0.68,
                          delay: reduceMotion ? 0 : 0.14,
                          ease,
                        }}
                      >
                        <div className={styles.readerTopbar}>
                          <span>Krasavitsa Journal</span>
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

                          <div className={styles.readerCopy}>
                            {(activeIssue.body?.length
                              ? activeIssue.body
                              : [activeIssue.excerpt]
                            ).map((paragraph, index) =>
                              index === 1 ? (
                                <blockquote key={`${activeIssue.slug}-${index}`}>
                                  {paragraph}
                                </blockquote>
                              ) : (
                                <p key={`${activeIssue.slug}-${index}`}>
                                  {paragraph}
                                </p>
                              ),
                            )}
                          </div>

                          <footer className={styles.readerFooter}>
                            <span>Редакция Красавицы</span>
                            <p>
                              Материал носит информационный характер и не заменяет
                              консультацию специалиста.
                            </p>
                            <Link href={`/blog/${activeIssue.slug}`}>
                              Читать и сохранить
                              <ArrowRight aria-hidden="true" />
                            </Link>
                          </footer>
                        </article>
                      </motion.div>
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
  returning,
  supportsViewTransition,
  reduceMotion,
  onOpen,
}: {
  post: JournalIssue;
  index: number;
  active: boolean;
  returning: boolean;
  supportsViewTransition: boolean;
  reduceMotion: boolean;
  onOpen: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  const titleId = `journal-spine-title-${post.slug}`;
  const style: SpineStyle = {
    "--issue-order": index,
    "--spine-height": spineHeights[index % spineHeights.length],
    "--spine-shift": spineShifts[index % spineShifts.length],
    viewTransitionName: returning ? "journal-active-issue" : undefined,
  };

  return (
    <motion.button
      type="button"
      layout
      layoutId={
        supportsViewTransition ? undefined : `journal-issue-${post.slug}`
      }
      initial={reduceMotion ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: active ? 0.18 : 1, x: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -18 }}
      transition={{ duration: reduceMotion ? 0.08 : 0.44, ease }}
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
    >
      <span className={styles.spineCap} aria-hidden="true" />
      <span className={styles.spineBrand}>KJ</span>
      <span className={styles.spineCategory}>{post.category}</span>
      <span id={titleId} className={styles.spineTitle}>
        {post.title}
      </span>
      <span className={styles.spineTime}>{post.readTime}</span>
      <ArrowUpRight className={styles.spineArrow} aria-hidden="true" />
      <span className={styles.spinePages} aria-hidden="true" />
      <span className={styles.spineGloss} aria-hidden="true" />
    </motion.button>
  );
}
