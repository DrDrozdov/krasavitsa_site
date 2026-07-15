"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";

type JournalIssue = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  image: string;
};

export function JournalStack({ posts }: { posts: JournalIssue[] }) {
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [openingSlug, setOpeningSlug] = useState<string>();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const copyY = useTransform(scrollYProgress, [0, .46, .78], [0, -42, -120]);
  const copyOpacity = useTransform(scrollYProgress, [0, .5, .78], [1, .82, 0]);
  const stackScale = useTransform(scrollYProgress, [0, .56, 1], [.94, 1, 1.08]);

  const openIssue = (slug: string) => {
    if (openingSlug) return;
    setOpeningSlug(slug);
    window.setTimeout(() => router.push(`/blog/${slug}`), reduceMotion ? 0 : 520);
  };

  return (
    <section ref={ref} className="journal-press-stage" aria-labelledby="journal-press-title">
      <div className="journal-press-sticky">
        <motion.div className="journal-press-copy" style={reduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}>
          <span>KRASAVITSA JOURNAL</span>
          <h1 id="journal-press-title">Идеи,<br />которые остаются.</h1>
          <p>Уход, ароматы и личный опыт — в выпусках, к которым хочется возвращаться.</p>
        </motion.div>

        <motion.div className="journal-issue-stack" style={reduceMotion ? undefined : { scale: stackScale }}>
          {posts.slice(0, 4).map((post, index) => (
            <MagazineIssueCard
              key={post.slug}
              post={post}
              index={index}
              progress={scrollYProgress}
              opening={openingSlug === post.slug}
              disabled={Boolean(openingSlug)}
              reduceMotion={Boolean(reduceMotion)}
              onOpen={() => openIssue(post.slug)}
            />
          ))}
        </motion.div>

        <div className="journal-press-hint"><span>Листайте выпуски</span><ArrowUpRight /></div>
      </div>
    </section>
  );
}

function MagazineIssueCard({
  post,
  index,
  progress,
  opening,
  disabled,
  reduceMotion,
  onOpen,
}: {
  post: JournalIssue;
  index: number;
  progress: MotionValue<number>;
  opening: boolean;
  disabled: boolean;
  reduceMotion: boolean;
  onOpen: () => void;
}) {
  const offset = index - 1.5;
  const x = useTransform(progress, [0, .28, .82, 1], [offset * 15, offset * 34, offset * 156, offset * 184]);
  const y = useTransform(progress, [0, .36, .82, 1], [index * 10, index * 5, Math.abs(offset) * 38, Math.abs(offset) * 24]);
  const rotate = useTransform(progress, [0, .32, .82], [offset * 4.5, offset * 2, offset * 8]);
  const rotateY = useTransform(progress, [0, .5, 1], [offset * -3, offset * -2, offset * -7]);

  return (
    <motion.button
      type="button"
      className={`journal-issue issue-${index + 1}${opening ? " is-opening" : ""}`}
      style={reduceMotion ? { zIndex: 10 - index } : { x, y, rotate, rotateY, zIndex: 10 - index }}
      animate={opening ? { scale: 1.12, rotateX: 0, filter: "brightness(1.06) blur(0px)" } : { scale: 1, filter: "brightness(1) blur(0px)" }}
      whileHover={reduceMotion || disabled ? undefined : { y: -18, rotateY: 0, scale: 1.025 }}
      whileTap={reduceMotion || disabled ? undefined : { scale: .985 }}
      transition={{ type: "spring", bounce: 0, duration: .42 }}
      disabled={disabled && !opening}
      onClick={onOpen}
      aria-label={`Открыть выпуск: ${post.title}`}
    >
      <span className="journal-issue-image"><Image src={post.image} alt="" fill sizes="(min-width: 900px) 34vw, 74vw" /></span>
      <span className="journal-issue-gloss" />
      <span className="journal-issue-content">
        <small>КРАСАВИЦА · {String(index + 1).padStart(2, "0")}</small>
        <strong>{post.title}</strong>
        <span>{post.category} · {post.readTime}</span>
      </span>
      <ArrowUpRight className="journal-issue-arrow" />
    </motion.button>
  );
}
