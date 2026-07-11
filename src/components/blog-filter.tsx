"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type BlogPost = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  image: string;
};

export function BlogFilter({ posts, categories }: { posts: BlogPost[]; categories: string[] }) {
  const [active, setActive] = useState("Все");
  const [liked, setLiked] = useState<string[]>([]);
  const filters = ["Все", ...categories];
  const visiblePosts = useMemo(
    () => (active === "Все" ? posts : posts.filter((post) => post.category === active)),
    [active, posts],
  );

  return (
    <>
      <div className="mx-auto flex max-w-[1480px] flex-wrap gap-2 px-3 pb-2 md:px-5">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setActive(item)}
            className={`apple-glass-button rounded-full border px-5 py-3 text-sm font-black backdrop-blur-xl transition duration-300 ${
              active === item
                ? "border-black/20 bg-black text-white"
                : "border-[var(--color-border)] bg-white/42 text-[var(--color-text-muted)] hover:bg-black hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <section className="mx-auto grid max-w-[1480px] gap-2 px-3 py-2 md:grid-cols-3 md:px-5">
        <AnimatePresence mode="popLayout">
          {visiblePosts.map((post) => (
            <motion.div
              key={post.slug}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.985, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, scale: 0.985, filter: "blur(8px)" }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            >
              <article className="apple-glass-card meaning-card flex min-h-[420px] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/34 shadow-[var(--shadow-card)] backdrop-blur-2xl">
                <Link href={`/blog/${post.slug}`} className="relative block h-48 overflow-hidden">
                  <Image src={post.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 ease-[var(--ease-soft)] hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(92,31,45,.22))]" />
                </Link>
                <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">
                    {post.category} · {post.readTime}
                  </p>
                  <h2 className="mt-4 text-3xl font-black leading-tight">{post.title}</h2>
                  <p className="mt-4 text-base font-semibold leading-7 text-[var(--color-text-muted)]">{post.excerpt}</p>
                </div>
                <div className="mt-8 flex items-center justify-between gap-3">
                  <Link href={`/blog/${post.slug}`} className="apple-glass-button brand-action inline-flex rounded-full px-5 py-3 text-sm font-black">Читать</Link>
                  <button type="button" aria-label="Отметить полезным" onClick={() => setLiked((current) => current.includes(post.slug) ? current.filter((item) => item !== post.slug) : [...current, post.slug])} className="apple-glass-button grid size-11 place-items-center rounded-full border border-[var(--color-border)] bg-white/38 text-[var(--color-bordeaux)]">
                    <Heart className={`size-5 ${liked.includes(post.slug) ? "fill-current" : ""}`} />
                  </button>
                </div>
                </div>
              </article>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>
    </>
  );
}
