import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BeautyPageShell, TelegramCTA } from "@/components/portal-components";
import { blogPosts, getPost } from "@/data/blog";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return { title: "Статья — Красавица" };
  }
  return {
    title: `${post.title} — Красавица`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <BeautyPageShell className="article-motion-page">
      <article className="longform-article section-shell">
        <header><Link href="/blog"><ArrowLeft />Назад в Journal</Link><p>{post.category} · {post.readTime}</p><h1>{post.title}</h1><strong>{post.excerpt}</strong></header>
        <div className="longform-cover"><Image src={post.image} alt="" fill priority sizes="(min-width: 1024px) 1200px, 100vw" /></div>
        <div className="longform-layout"><aside><span>Красавица / редакция</span><p>Материал носит информационный характер и не заменяет очную консультацию специалиста.</p></aside><div className="longform-copy">{post.body.map((paragraph, index) => index === 1 ? <div key={paragraph} className="longform-pullquote"><Sparkles /><p>{paragraph}</p></div> : <p key={paragraph}>{paragraph}</p>)}</div></div>
      </article>
      <section className="longform-next section-shell"><p>После чтения</p><h2>Превратите тему<br />в личный запрос.</h2><span>Опишите свою ситуацию, бюджет и ограничения. Красавица соберёт подбор не по тренду, а по задаче.</span><Link href="/care">Начать подбор</Link></section>
      <TelegramCTA title="Подобрать уход по этой теме" text="Продолжите в Telegram, чтобы Красавица задала уточняющие вопросы и сохранила рекомендации." />
    </BeautyPageShell>
  );
}
