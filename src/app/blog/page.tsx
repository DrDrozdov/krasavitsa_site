import type { Metadata } from "next";
import Link from "next/link";
import { BlogFilter } from "@/components/blog-filter";
import { BlogStudio } from "@/components/blog-studio";
import { BeautyPageShell, BeautyPortalGrid, PageHero, PortalPanel, SectionIntro, TelegramCTA } from "@/components/portal-components";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Блог об уходе и ароматах — Красавица",
  description: "Большие материалы Красавицы об уходе, SPF, составах и парфюмерии без тревожной подачи.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const featured = blogPosts[0];
  const categories = [...new Set(blogPosts.map((post) => post.category))];

  return (
    <BeautyPageShell>
      <PageHero
        eyebrow="Редакция"
        title="Знания, которые помогают выбирать спокойнее"
        subtitle="Не пересказываем тренды. Разбираем задачу, контекст и реальную роль каждого шага — от базового крема до первого знакомства с ароматом."
        cta="Перейти к материалам"
        ctaHref="#articles"
        image="/beauty-bg-03.svg"
        tiles={["Уход", "Составы", "SPF", "Парфюм"]}
      />

      <section className="px-3 py-8 md:px-5 md:py-12">
        <BeautyPortalGrid className="min-h-0">
          <PortalPanel className="md:col-span-8" image={featured.image}>
            <div className="flex min-h-[430px] flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Выбор редакции · {featured.readTime}</p>
                <h2 className="mt-5 max-w-4xl text-[clamp(2.7rem,5.5vw,5.8rem)] font-black leading-[0.92]">{featured.title}</h2>
              </div>
              <p className="max-w-2xl text-base font-semibold leading-7 text-[var(--color-text-muted)]">{featured.excerpt}</p>
            </div>
          </PortalPanel>
          <PortalPanel className="brand-panel md:col-span-4">
            <div className="flex h-full min-h-[320px] flex-col justify-between">
              <div>
                <p className="text-xs font-black uppercase text-white/52">Принцип</p>
                <h3 className="mt-4 text-4xl font-black leading-[0.96] text-white">Одна статья — один ясный вопрос</h3>
                <p className="mt-5 text-sm font-semibold leading-6 text-white/66">Воздух остаётся вокруг смысла, а каждый материал заканчивается практическим следующим шагом.</p>
              </div>
              <Link href={`/blog/${featured.slug}`} className="apple-glass-button rounded-full bg-white px-6 py-4 text-center text-sm font-black text-[var(--color-bordeaux)]">Читать материал</Link>
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>

      <div id="articles">
        <SectionIntro kicker="Материалы" title="Читайте по задаче, а не по тревоге" text="Четыре глубоких направления вместо бесконечной ленты коротких советов." />
        <BlogFilter posts={blogPosts} categories={categories} />
      </div>

      <BlogStudio />
      <TelegramCTA title="Превратить знания в личный план" text="Опишите задачу, бюджет и ограничения — Красавица соберёт персональный сценарий ухода в Telegram." />
    </BeautyPageShell>
  );
}
