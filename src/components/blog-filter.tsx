"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

type BlogPost = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
};

export function BlogFilter({ posts, categories }: { posts: BlogPost[]; categories: string[] }) {
  const [active, setActive] = useState("Все");
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
              <Link
                href={`/blog/${post.slug}`}
                className="apple-glass-card flex min-h-[280px] flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/34 p-6 shadow-[var(--shadow-card)] backdrop-blur-2xl"
              >
                <div>
                  <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">
                    {post.category} · {post.readTime}
                  </p>
                  <h2 className="mt-4 text-3xl font-black leading-tight">{post.title}</h2>
                  <p className="mt-4 text-base font-semibold leading-7 text-[var(--color-text-muted)]">{post.excerpt}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-black">Читать</span>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>
    </>
  );
}
