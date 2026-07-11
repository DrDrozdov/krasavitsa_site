import Image from "next/image";
import Link from "next/link";

type LegalSection = {
  title: string;
  text: string;
};

export function LegalPage({ title, subtitle, sections }: { title: string; subtitle: string; sections: LegalSection[] }) {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-6 text-[var(--color-text)] md:px-8">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/krasavitsa-logo.png" alt="Красавица" width={46} height={46} className="rounded-full" />
          <span>
            <span className="block text-xl font-black uppercase leading-none">Красавица</span>
            <span className="mt-1 block text-[10px] font-normal uppercase leading-none text-black/38">Beauty OS</span>
          </span>
        </Link>
        <Link href="/" className="apple-glass-button brand-action rounded-full px-5 py-3 text-sm font-bold backdrop-blur-xl">
          На главную
        </Link>
      </header>

      <section className="liquid-glass mx-auto mt-10 max-w-5xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/32 p-6 shadow-[var(--shadow-soft)] backdrop-blur-2xl md:p-10">
        <p className="text-sm font-black uppercase text-black/40">Юридическая информация</p>
        <h1 className="mt-4 max-w-4xl text-[clamp(2.8rem,7vw,6.5rem)] font-black leading-[0.94] tracking-tight">{title}</h1>
        <p className="mt-6 max-w-3xl text-lg font-semibold leading-8 text-black/58">{subtitle}</p>
      </section>

      <section className="mx-auto mt-3 grid max-w-5xl gap-3">
        {sections.map((section) => (
          <article key={section.title} className="meaning-card rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/32 p-6 shadow-[var(--shadow-card)] backdrop-blur-2xl md:p-8">
            <h2 className="text-2xl font-black">{section.title}</h2>
            <p className="mt-4 whitespace-pre-line text-base font-semibold leading-8 text-black/58">{section.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
