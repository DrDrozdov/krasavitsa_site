import type { Metadata } from "next";
import Link from "next/link";
import { BeautyPageShell, BeautyPortalGrid, PageHero, PortalPanel, SectionIntro, TelegramCTA } from "@/components/portal-components";
import { BlogFilter } from "@/components/blog-filter";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Блог о косметике и уходе — Красавица",
  description: "Статьи Красавицы об уходе, SPF, составах, ошибках ухода и будущих пользовательских материалах.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const categories = ["Уход", "Акне", "SPF", "Составы", "Парфюм", "Подборки", "Ошибки ухода", "Anti-age"];
  const featured = blogPosts[0];

  return (
    <BeautyPageShell>
      <PageHero
        eyebrow="Блог"
        title="Спокойные тексты об уходе без шума"
        subtitle="Разбираем косметику, составы, SPF, ошибки ухода и выбор ароматов простым языком."
        cta="Начать подбор"
        ctaHref="/care"
        tiles={["Уход", "Составы", "SPF", "Парфюм"]}
      />
      <SectionIntro
        kicker="Редакция"
        title="Читайте по задаче, а не по тревоге"
        text="Материалы помогают понять кожу, не перегрузить уход и спокойнее выбирать средства."
      />
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
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Медиа-логика</p>
                <h3 className="mt-3 text-3xl font-black leading-tight">Короткие сценарии вместо случайной ленты</h3>
                <p className="mt-4 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
                  Каждая статья ведет к действию: понять проблему, убрать лишнее и перейти к персональному подбору.
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
        <div className="liquid-glass grid gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/30 p-2 backdrop-blur-2xl md:grid-cols-[1fr_1fr_1fr]">
          {["Сначала база", "Потом активы", "После — покупки"].map((item, index) => (
            <div key={item} className="apple-glass-card rounded-[var(--radius-lg)] border border-white/60 bg-white/34 p-5 backdrop-blur-2xl">
              <p className="text-xs font-black text-[var(--color-text-soft)]">0{index + 1}</p>
              <p className="mt-2 text-2xl font-black">{item}</p>
            </div>
          ))}
        </div>
      </section>
      <BlogFilter posts={blogPosts} categories={categories} />
      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-5">
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Авторский стол</p>
            <h2 className="mt-4 text-[clamp(2.2rem,4vw,4.2rem)] font-black leading-none">Пользовательские статьи</h2>
            <p className="mt-5 text-base font-semibold leading-7 text-[var(--color-text-muted)]">
              Раздел готовится под материалы пользователей: имя автора, история ухода, рейтинг полезности и комментарии.
            </p>
          </PortalPanel>
          <PortalPanel className="md:col-span-7">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Автор", "Анна, 29 · комбинированная кожа"],
                ["Тема", "Как не купить лишнее после первых рекомендаций"],
                ["Реакции", "Полезно · Сохранить · Обсудить"],
                ["Комментарии", "Будущий блок коротких ответов сообщества"],
              ].map(([title, text]) => (
                <div key={title} className="apple-glass-card rounded-[var(--radius-md)] border border-white/60 bg-white/34 p-5 backdrop-blur-2xl">
                  <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">{title}</p>
                  <p className="mt-3 text-xl font-black leading-tight">{text}</p>
                </div>
              ))}
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>
      <TelegramCTA title="Подобрать уход по статье" text="Если материал похож на вашу ситуацию, Красавица поможет собрать персональный уход в Telegram." />
    </BeautyPageShell>
  );
}
