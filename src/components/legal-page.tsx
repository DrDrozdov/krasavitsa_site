"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type LegalSection = { title: string; text: string };

export function LegalPage({ title, subtitle, sections }: { title: string; subtitle: string; sections: LegalSection[] }) {
  const [active, setActive] = useState(0);
  const current = sections[active] ?? sections[0];

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-5 text-[var(--color-text)] md:px-6 md:py-8">
      <header className="mx-auto flex max-w-[1380px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label="Красавица: на главную">
          <Image src="/krasavitsa-logo.png" alt="" width={44} height={44} className="rounded-full" />
          <span><span className="block text-lg font-black uppercase leading-none">Красавица</span><span className="mt-1 block text-[10px] font-medium uppercase text-[var(--color-text-soft)]">Документы</span></span>
        </Link>
        <Link href="/" className="apple-glass-button brand-action rounded-full px-5 py-3 text-sm font-black">На главную</Link>
      </header>

      <section className="legal-hero liquid-glass mx-auto mt-5 max-w-[1380px] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)] md:p-10">
        <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Актуальная редакция: 12 июля 2026 года</p>
        <h1 className="mt-4 max-w-4xl text-[clamp(2.8rem,6vw,6rem)] font-black leading-[0.92]">{title}</h1>
        <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-[var(--color-text-muted)] md:text-lg">{subtitle}</p>
      </section>

      <section className="mx-auto mt-3 grid max-w-[1380px] gap-3 lg:grid-cols-[minmax(230px,.32fr)_minmax(0,1fr)]">
        <aside className="legal-toc liquid-glass rounded-[var(--radius-xl)] border border-[var(--color-border)] p-3 shadow-[var(--shadow-card)] lg:sticky lg:top-5 lg:h-fit">
          <p className="px-3 pb-3 pt-2 text-xs font-black uppercase text-[var(--color-text-soft)]">Оглавление</p>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
            {sections.map((section, index) => (
              <button key={section.title} type="button" onClick={() => setActive(index)} aria-pressed={active === index} className={`legal-toc-button ${active === index ? "is-active" : ""}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>{section.title.replace(/^\d+\.\s*/, "")}
              </button>
            ))}
          </div>
        </aside>
        <article className="legal-document liquid-glass min-h-[420px] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-card)] md:p-10">
          <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Раздел {String(active + 1).padStart(2, "0")} из {String(sections.length).padStart(2, "0")}</p>
          <h2 className="mt-4 max-w-3xl text-[clamp(2rem,3.5vw,3.8rem)] font-black leading-[0.98]">{current.title.replace(/^\d+\.\s*/, "")}</h2>
          <p className="mt-7 max-w-4xl whitespace-pre-line text-base font-medium leading-8 text-[var(--color-text-muted)] md:text-lg md:leading-9">{current.text}</p>
          <div className="mt-10 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-5">
            <Link href="/privacy" className="legal-document-link">Конфиденциальность</Link>
            <Link href="/terms" className="legal-document-link">Соглашение</Link>
            <Link href="/cookies" className="legal-document-link">Cookies</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
