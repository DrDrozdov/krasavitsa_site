import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, PenLine } from "lucide-react";
import { BlogFilter } from "@/components/blog-filter";
import { BlogStudio } from "@/components/blog-studio";
import { BeautyPageShell, TelegramCTA } from "@/components/portal-components";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Красавица Journal — уход, составы и ароматы",
  description: "Редакционные материалы Красавицы об уходе, SPF, составах и парфюмерии без тревожной подачи.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const featured = blogPosts[0];
  const categories = [...new Set(blogPosts.map((post) => post.category))];
  const edition = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(new Date());

  return (
    <BeautyPageShell>
      <header className="journal-masthead section-shell">
        <div className="journal-utility"><span>Редакция о красоте</span><span>{edition}</span><a href="#write"><PenLine />Создать статью</a></div>
        <div className="journal-title-lockup"><h1>Журнал</h1><span>Красавицы</span></div>
        <div className="journal-deck"><p>Разбираем уход, составы и ароматы с уважением к контексту — без тревожной ленты и рекламного шума.</p><a href="#articles">К свежему выпуску <ArrowDownRight /></a></div>
      </header>

      <section className="journal-lead section-shell" id="articles">
        <Link href={`/blog/${featured.slug}`} className="journal-lead-image">
          <Image src={featured.image} alt="" fill priority sizes="(min-width: 900px) 62vw, 100vw" />
          <span>Выбор редакции</span>
        </Link>
        <article className="journal-lead-copy">
          <p>{featured.category} · {featured.readTime}</p>
          <h2><Link href={`/blog/${featured.slug}`}>{featured.title}</Link></h2>
          <div><p>{featured.excerpt}</p><Link href={`/blog/${featured.slug}`}>Читать материал <ArrowRight /></Link></div>
        </article>
        <aside className="journal-editor-note"><span>Письмо редакции / 01</span><strong>Один текст — один ясный вопрос.</strong><p>Каждый материал заканчивается практическим следующим шагом, а не списком новых тревог.</p></aside>
      </section>

      <section className="journal-index section-shell">
        <div><p>Архив выпуска</p><h2>Читайте по задаче,<br />а не по тревоге.</h2></div>
        <BlogFilter posts={blogPosts.slice(1)} categories={categories} />
      </section>

      <BlogStudio />
      <TelegramCTA title="Превратить знания в личный план" text="Опишите задачу, бюджет и ограничения — Красавица соберёт персональный сценарий ухода в Telegram." />
    </BeautyPageShell>
  );
}
