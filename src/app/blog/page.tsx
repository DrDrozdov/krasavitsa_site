import type { Metadata } from "next";
import Link from "next/link";
import { BeautyPageShell, BeautyPortalGrid, PageHero, PortalPanel, SectionIntro, TelegramCTA } from "@/components/portal-components";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Блог о косметике и уходе — Красавица",
  description: "Статьи Красавицы об уходе, SPF, составах, ошибках ухода и будущем подборе парфюма.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const categories = ["Уход", "Акне", "SPF", "Составы", "Парфюм", "Подборки", "Ошибки ухода"];
  const featured = blogPosts[0];

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
      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-7" image="/beauty-products-portal.png">
            <div className="flex min-h-[390px] flex-col justify-between">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Рекомендуем начать</p>
                <h2 className="mt-4 text-[clamp(2.35rem,4.4vw,4.8rem)] font-black leading-none">{featured.title}</h2>
              </div>
              <p className="max-w-2xl text-base font-semibold leading-7 text-[var(--color-text-muted)]">{featured.excerpt}</p>
            </div>
          </PortalPanel>
          <PortalPanel className="md:col-span-5">
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Навигация</p>
                <h3 className="mt-3 text-3xl font-black leading-tight">Читайте по ситуации, а не по тревоге</h3>
                <p className="mt-4 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
                  У каждой статьи есть короткий сценарий: понять проблему, не перегрузить уход и перейти к персональному подбору.
                </p>
              </div>
              <Link href={`/blog/${featured.slug}`} className="apple-glass-button w-fit rounded-full bg-black px-6 py-4 text-sm font-black text-white">
                Читать подборку
              </Link>
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>
      <section className="px-3 py-2 md:px-5">
        <div className="liquid-glass grid gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/34 p-2 backdrop-blur-2xl md:grid-cols-[1fr_1fr_1fr]">
          {["Сначала база", "Потом активы", "После — покупки"].map((item, index) => (
            <div key={item} className="rounded-[var(--radius-lg)] border border-white/60 bg-white/38 p-5">
              <p className="text-xs font-black text-[var(--color-text-soft)]">0{index + 1}</p>
              <p className="mt-2 text-2xl font-black">{item}</p>
            </div>
          ))}
        </div>
      </section>
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
