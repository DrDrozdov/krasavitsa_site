import type { Metadata } from "next";
import Link from "next/link";
import { BeautyPageShell, PageHero, SectionIntro, TelegramCTA } from "@/components/portal-components";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Блог о косметике и уходе — Красавица",
  description: "Статьи Красавицы об уходе, SPF, составах, ошибках ухода и будущем подборе парфюма.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const categories = ["Уход", "Акне", "SPF", "Составы", "Парфюм", "Подборки", "Ошибки ухода"];

  return (
    <BeautyPageShell>
      <PageHero
        eyebrow="Блог"
        title="Спокойные тексты об уходе без шума"
        subtitle="Разбираем косметику, составы, SPF, ошибки ухода и выбор аромата простым языком."
        cta="Начать подбор"
        tiles={["Уход", "Составы", "SPF", "Парфюм"]}
      />
      <SectionIntro kicker="Категории" title="Читайте по задаче, а не по тренду" text="Материалы помогают понять кожу, не перегрузить уход и спокойнее выбирать средства." />
      <div className="mx-auto flex max-w-[1480px] flex-wrap gap-2 px-3 pb-2 md:px-5">
        {categories.map((item) => (
          <span key={item} className="rounded-full border border-[var(--color-border)] bg-white/62 px-5 py-3 text-sm font-black text-[var(--color-text-muted)] backdrop-blur-xl">
            {item}
          </span>
        ))}
      </div>
      <section className="mx-auto grid max-w-[1480px] gap-2 px-3 py-2 md:grid-cols-3 md:px-5">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="apple-glass-card flex min-h-[280px] flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-glass)] p-6 shadow-[var(--shadow-card)] backdrop-blur-2xl">
            <div>
              <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">{post.category} · {post.readTime}</p>
              <h2 className="mt-4 text-3xl font-black leading-tight">{post.title}</h2>
              <p className="mt-4 text-base font-semibold leading-7 text-[var(--color-text-muted)]">{post.excerpt}</p>
            </div>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-black">Читать</span>
          </Link>
        ))}
      </section>
      <TelegramCTA title="Подобрать уход по статье" text="Если материал похож на вашу ситуацию, Красавица поможет собрать персональный уход в Telegram." />
    </BeautyPageShell>
  );
}
