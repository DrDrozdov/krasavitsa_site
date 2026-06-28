import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BeautyPageShell } from "@/components/portal-components";
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
    <BeautyPageShell>
      <article className="mx-auto max-w-4xl px-4 py-10 md:py-16">
        <Link href="/blog" className="text-sm font-black text-[var(--color-text-soft)] hover:text-[var(--color-text)]">Назад в блог</Link>
        <p className="mt-8 text-sm font-black uppercase text-[var(--color-text-soft)]">{post.category} · {post.readTime}</p>
        <h1 className="mt-4 text-[clamp(3rem,7vw,6.8rem)] font-black leading-[0.94] tracking-tight">{post.title}</h1>
        <p className="mt-6 text-xl font-semibold leading-9 text-[var(--color-text-muted)]">{post.excerpt}</p>
        <div className="mt-10 grid gap-4">
          {post.body.map((paragraph) => (
            <p key={paragraph} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/68 p-6 text-lg font-semibold leading-9 text-[var(--color-text-muted)] shadow-[var(--shadow-card)] backdrop-blur-2xl">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </BeautyPageShell>
  );
}
