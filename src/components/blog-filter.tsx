"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Heart } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";

type BlogPost = { slug: string; title: string; category: string; readTime: string; excerpt: string; image: string };

export function BlogFilter({ posts, categories }: { posts: BlogPost[]; categories: string[] }) {
  const [active, setActive] = useState("Все");
  const [liked, setLiked] = useState<string[]>([]);
  const reduceMotion = useReducedMotion();
  const filters = ["Все", ...categories];
  const visiblePosts = useMemo(() => active === "Все" ? posts : posts.filter((post) => post.category === active), [active, posts]);

  return <div className="journal-archive">
    <div className="journal-filters" aria-label="Фильтр материалов">{filters.map((item) => <button key={item} type="button" aria-pressed={active === item} onClick={() => setActive(item)} className={active === item ? "is-active" : ""}>{item}</button>)}</div>
    <div className="journal-article-list"><AnimatePresence mode="popLayout">
      {visiblePosts.map((post, index) => <motion.article key={post.slug} layout initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .26, ease: [0.16, 1, 0.3, 1] }}>
        <Link href={`/blog/${post.slug}`} className="journal-article-image"><Image src={post.image} alt="" fill sizes="(min-width: 900px) 24vw, 34vw" /></Link>
        <div className="journal-article-number">{String(index + 2).padStart(2, "0")}</div>
        <div className="journal-article-copy"><p>{post.category} · {post.readTime}</p><h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><span>{post.excerpt}</span></div>
        <div className="journal-article-actions"><button type="button" aria-label="Отметить полезным" onClick={() => setLiked((current) => current.includes(post.slug) ? current.filter((item) => item !== post.slug) : [...current, post.slug])}><Heart className={liked.includes(post.slug) ? "fill-current" : ""} /></button><Link href={`/blog/${post.slug}`} aria-label="Читать"><ArrowUpRight /></Link></div>
      </motion.article>)}
    </AnimatePresence></div>
  </div>;
}
