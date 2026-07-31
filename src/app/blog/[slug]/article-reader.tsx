"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import styles from "./article-reader.module.css";
import { JournalReadingProgress } from "@/components/journal-reading-progress";
import type { BlogPost } from "@/data/blog";

const ease = [0.16, 1, 0.3, 1] as const;

export function ArticleReader({ post }: { post: BlogPost }) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <JournalReadingProgress />
      <main className={styles.page}>
        <header className={styles.utility}>
          <Link href="/blog">
            <ArrowLeft aria-hidden="true" />
            Назад в журнал
          </Link>
          <span>
            {post.category} / {post.readTime}
          </span>
        </header>

        <div className={styles.layout}>
          <motion.aside
            className={styles.coverRail}
            initial={
              reduceMotion
                ? false
                : { opacity: 0, transform: "translate3d(-26px, 0, 0)" }
            }
            animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
            transition={{ duration: 0.72, ease }}
          >
            <figure className={styles.cover}>
              <Image
                src={post.image}
                alt=""
                fill
                fetchPriority="high"
                sizes="(max-width: 760px) 100vw, 43vw"
              />
              <span className={styles.coverWash} aria-hidden="true" />
              <figcaption>
                <span>
                  {post.category} / {post.readTime}
                </span>
                <strong>{post.title}</strong>
                <small>Красавица</small>
              </figcaption>
              <i aria-hidden="true" />
            </figure>

            <div className={styles.coverNote}>
              <span>Редакция Красавицы</span>
              <p>
                Материал носит информационный характер и не заменяет консультацию
                специалиста.
              </p>
            </div>
          </motion.aside>

          <article className={styles.story}>
            <Reveal reduceMotion={Boolean(reduceMotion)}>
              <header className={styles.storyHeader}>
                <p>{post.category}</p>
                <h1>{post.title}</h1>
                <strong>{post.excerpt}</strong>
              </header>
            </Reveal>

            <div className={styles.copy}>
              {post.body.map((paragraph, index) =>
                index === 1 ? (
                  <Reveal
                    key={`${post.slug}-${index}`}
                    reduceMotion={Boolean(reduceMotion)}
                  >
                    <blockquote>{paragraph}</blockquote>
                  </Reveal>
                ) : (
                  <Reveal
                    key={`${post.slug}-${index}`}
                    reduceMotion={Boolean(reduceMotion)}
                  >
                    <p>{paragraph}</p>
                  </Reveal>
                ),
              )}
            </div>

            <Reveal reduceMotion={Boolean(reduceMotion)}>
              <footer className={styles.storyFooter}>
                <span>Продолжить исследование</span>
                <h2>Вернитесь к полке и выберите следующий выпуск.</h2>
                <Link href="/blog">
                  Открыть журнал
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </footer>
            </Reveal>
          </article>
        </div>
      </main>
    </>
  );
}

function Reveal({
  children,
  reduceMotion,
}: {
  children: ReactNode;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : { opacity: 0, transform: "translate3d(0, 24px, 0)" }
      }
      whileInView={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: reduceMotion ? 0.12 : 0.62,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}
