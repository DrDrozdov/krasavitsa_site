import type { Metadata } from "next";
import { Download, LogOut, ShieldCheck } from "lucide-react";
import { isAdminSession } from "@/lib/admin-auth";
import { getAnalyticsSnapshot } from "@/lib/analytics-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Аналитика — Красавица", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const authenticated = await isAdminSession();
  if (!authenticated) return <AdminLogin error={Boolean((await searchParams).error)} />;
  const snapshot = await getAnalyticsSnapshot(30);
  const max = Math.max(1, ...snapshot.daily.map((day) => day.events.page_view ?? 0));
  const cards = [
    ["Просмотры", snapshot.totals.pageviews], ["Действия", snapshot.totals.cta], ["Переходы в Telegram", snapshot.totals.telegram], ["Поиски", snapshot.totals.searches], ["Ошибки", snapshot.totals.errors],
  ];

  return (
    <main className="min-h-screen bg-[var(--color-bg)] p-3 text-[var(--color-text)] md:p-6">
      <header className="brand-panel flex flex-col justify-between gap-6 rounded-[var(--radius-xl)] p-6 md:flex-row md:items-center md:p-8">
        <div>
          <p className="text-xs font-black uppercase text-white/52">Закрытый контур</p>
          <h1 className="mt-3 text-[clamp(2.6rem,5vw,5rem)] font-black leading-none">Красавица Аналитик</h1>
          <p className="mt-4 text-sm font-semibold text-white/64">Только обезличенные агрегаты. IP, тексты запросов и постоянные идентификаторы не сохраняются.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/api/admin/export" className="apple-glass-button inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[var(--color-bordeaux)]"><Download className="size-4" /> CSV</a>
          <form action="/api/admin/logout" method="post"><button className="apple-glass-button inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-5 py-3 text-sm font-black text-white"><LogOut className="size-4" /> Выйти</button></form>
        </div>
      </header>

      <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => <article key={label} className="liquid-glass meaning-card rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/28 p-5 backdrop-blur-2xl"><p className="text-xs font-black uppercase text-[var(--color-text-soft)]">{label}</p><p className="mt-5 text-5xl font-black">{value}</p><p className="mt-3 text-xs font-semibold text-[var(--color-text-muted)]">за 30 дней</p></article>)}
      </section>

      <section className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_.6fr]">
        <article className="liquid-glass rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/28 p-5 backdrop-blur-2xl md:p-7">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Динамика</p><h2 className="mt-2 text-3xl font-black">Просмотры по дням</h2></div><span className="rounded-full bg-[var(--color-bordeaux)] px-4 py-2 text-xs font-black text-white">30 дней</span></div>
          <div className="mt-8 flex h-64 items-end gap-1.5 border-b border-[var(--color-border)]">
            {snapshot.daily.length ? snapshot.daily.map((day) => <div key={day.date} title={`${day.date}: ${day.events.page_view ?? 0}`} className="min-w-1 flex-1 rounded-t-full bg-[var(--color-bordeaux)]/80 transition hover:bg-[var(--color-bordeaux)]" style={{ height: `${Math.max(3, ((day.events.page_view ?? 0) / max) * 100)}%` }} />) : <p className="m-auto text-sm font-semibold text-[var(--color-text-muted)]">Данные появятся после первых посещений.</p>}
          </div>
        </article>
        <article className="brand-panel rounded-[var(--radius-xl)] p-6">
          <ShieldCheck className="size-9" />
          <h2 className="mt-8 text-3xl font-black">Контур приватности</h2>
          <div className="mt-6 grid gap-3 text-sm font-semibold text-white/68">
            <p>Без IP и геолокации</p><p>Без текста запросов</p><p>Без visitor ID и fingerprint</p><p>Экспорт только агрегатов</p><p>Доступ по серверной сессии</p>
          </div>
        </article>
      </section>
    </main>
  );
}

function AdminLogin({ error }: { error: boolean }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] p-4 text-[var(--color-text)]">
      <section className="brand-panel w-full max-w-lg rounded-[var(--radius-xxl)] p-6 shadow-[var(--shadow-soft)] md:p-10">
        <ShieldCheck className="size-10" />
        <p className="mt-10 text-xs font-black uppercase text-white/52">Только для администратора</p>
        <h1 className="mt-3 text-5xl font-black leading-none">Красавица Аналитик</h1>
        <form action="/api/admin/login" method="post" className="mt-8">
          <label className="block rounded-full border border-white/18 bg-white/10 px-5 py-4 backdrop-blur-2xl"><span className="sr-only">Пароль</span><input name="password" type="password" required autoComplete="current-password" placeholder="Пароль администратора" className="w-full bg-transparent font-bold text-white outline-none placeholder:text-white/42" /></label>
          {error ? <p className="mt-3 text-sm font-bold text-[#ffd0d6]">Пароль не принят.</p> : null}
          <button className="apple-glass-button mt-4 w-full rounded-full bg-white px-6 py-4 text-sm font-black text-[var(--color-bordeaux)]">Открыть дашборд</button>
        </form>
      </section>
    </main>
  );
}
