import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BeautyPageShell, BeautyPortalGrid, PortalPanel, TelegramCTA } from "@/components/portal-components";
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
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)]">
          <Image src={post.image} alt="" fill priority sizes="(min-width: 1024px) 896px, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(92,31,45,.18))]" />
        </div>
        <div className="mt-6 grid gap-4">
          {post.body.map((paragraph) => (
            <p key={paragraph} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/68 p-6 text-lg font-semibold leading-9 text-[var(--color-text-muted)] shadow-[var(--shadow-card)] backdrop-blur-2xl">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-5">
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">После чтения</p>
            <h2 className="mt-4 text-[clamp(2.1rem,3.6vw,3.8rem)] font-black leading-none">Превратите материал в личный запрос</h2>
          </PortalPanel>
          <PortalPanel className="md:col-span-7">
            <p className="text-lg font-semibold leading-8 text-[var(--color-text-muted)]">
              Если статья похожа на вашу ситуацию, опишите кожу, бюджет и текущий уход. Красавица соберет подбор не по тренду, а по задаче.
            </p>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>
      <TelegramCTA title="Подобрать уход по этой теме" text="Продолжите в Telegram, чтобы Красавица задала уточняющие вопросы и сохранила рекомендации." />
    </BeautyPageShell>
  );
}
