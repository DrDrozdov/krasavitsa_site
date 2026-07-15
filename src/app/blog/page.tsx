import type { Metadata } from "next";
import { PenLine } from "lucide-react";
import { BlogFilter } from "@/components/blog-filter";
import { BlogStudio } from "@/components/blog-studio";
import { JournalStack } from "@/components/journal-stack";
import { BeautyPageShell, TelegramCTA } from "@/components/portal-components";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Журнал Красавицы — уход, составы и ароматы",
  description: "Редакционные материалы Красавицы об уходе, SPF, составах и парфюмерии без тревожной подачи.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const categories = [...new Set(blogPosts.map((post) => post.category))];

  return (
    <BeautyPageShell className="journal-motion-page">
      <header className="journal-masthead journal-press-nav section-shell">
        <div className="journal-utility"><span>Красавица · Журнал</span><span>Истории, опыт и ясные разборы</span><a href="#write"><PenLine />Создать статью</a></div>
        <nav className="journal-section-nav" aria-label="Темы журнала">
          {categories.map((category) => <a key={category} href="#articles">{category}</a>)}
        </nav>
      </header>

      <JournalStack posts={blogPosts} />

      <section className="journal-index journal-page-index section-shell" id="articles">
        <div><p>Архив выпусков</p><h2>Читайте медленнее.<br />Выбирайте точнее.</h2><span>Каждый материал — отдельная глянцевая страница: одна тема, ясный вывод и место для обсуждения.</span></div>
        <BlogFilter posts={blogPosts} categories={categories} />
      </section>

      <BlogStudio />
      <TelegramCTA title="Превратить знания в личный план" text="Опишите задачу, бюджет и ограничения — Красавица соберёт персональный сценарий ухода в Telegram." />
    </BeautyPageShell>
  );
}
