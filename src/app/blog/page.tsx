import type { Metadata } from "next";
import { PenLine } from "lucide-react";
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
  return (
    <BeautyPageShell className="journal-motion-page">
      <header className="journal-masthead journal-press-nav section-shell">
        <div className="journal-utility"><span>Красавица · Журнал</span><span>Истории, опыт и ясные разборы</span><a href="#write"><PenLine />Создать статью</a></div>
        <nav className="journal-section-nav" aria-label="Разделы журнала">
          <a href="#journal-library">Коллекция</a>
          <a href="#write">Стать автором</a>
        </nav>
      </header>

      <JournalStack posts={blogPosts} />

      <BlogStudio />
      <TelegramCTA title="Превратить знания в личный план" text="Опишите задачу, бюджет и ограничения — Красавица соберёт персональный сценарий ухода в Telegram." />
    </BeautyPageShell>
  );
}
