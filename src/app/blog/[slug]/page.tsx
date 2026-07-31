import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { ArticleReader } from "./article-reader";
import styles from "./article-reader.module.css";
import { BeautyPageShell, TelegramCTA } from "@/components/portal-components";
import { blogPosts, getPost } from "@/data/blog";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return { title: "Статья | Красавица" };
  }

  return {
    title: `${post.title} | Красавица`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <BeautyPageShell className="article-motion-page">
      <ArticleReader post={post} />

      <section className={styles.next}>
        <p>После чтения</p>
        <h2>Превратите тему в личный запрос.</h2>
        <span>
          Опишите свою ситуацию, бюджет и ограничения. Красавица соберёт подбор
          по задаче, а не по тренду.
        </span>
        <Link href="/care">
          Начать подбор
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <TelegramCTA
        title="Подобрать уход по этой теме"
        text="Продолжите в Telegram, чтобы Красавица задала уточняющие вопросы и сохранила рекомендации."
      />
    </BeautyPageShell>
  );
}
