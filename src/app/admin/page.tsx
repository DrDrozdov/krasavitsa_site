import type { Metadata } from "next";
import { Activity, Download, Gauge, LogOut, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import { hasAdminAccess, isAdminSession } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import { getAnalyticsSnapshot } from "@/lib/analytics-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Аналитика — Красавица", robots: { index: false, follow: false } };

const number = new Intl.NumberFormat("ru-RU");
const compact = new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 });

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  if (!(await hasAdminAccess())) notFound();
  const authenticated = await isAdminSession();
  if (!authenticated) return <AdminLogin error={params.error} />;

  const snapshot = await getAnalyticsSnapshot(30);
  const cards = [
    { label: "Просмотры", value: number.format(snapshot.totals.pageviews), note: `${percent(snapshot.rates.engaged)} вовлечены`, icon: Activity },
    { label: "AI-поиски", value: number.format(snapshot.totals.searches), note: `${percent(snapshot.rates.searchSuccess)} завершены`, icon: Search },
    { label: "Скорость ответа", value: duration(snapshot.averages.searchMs), note: `${snapshot.averages.products.toFixed(1)} средства / подбор`, icon: Gauge },
    { label: "Профиль и контент", value: number.format(snapshot.totals.profiles + snapshot.totals.articleSaves + snapshot.totals.favoriteSaves), note: "входы · статьи · избранное", icon: Users },
  ];
  const funnel = [
    { label: "Открыли сайт", value: snapshot.totals.pageviews },
    { label: "Остались 15+ секунд", value: snapshot.totals.engaged },
    { label: "Запустили подбор", value: snapshot.totals.searches },
    { label: "Получили результат", value: snapshot.totals.searchSuccess },
    { label: "Сохранили в избранное", value: snapshot.totals.favoriteSaves },
  ];

  return (
    <main className="admin-dashboard min-h-screen bg-[var(--color-bg)] p-3 text-[var(--color-text)] md:p-6">
      <header className="admin-hero grid gap-8 overflow-hidden rounded-[1.25rem] bg-[var(--color-bordeaux)] p-6 text-white md:grid-cols-[1fr_auto] md:items-end md:p-9">
        <div>
          <p className="text-xs font-bold tracking-[.18em] text-white/56">ЗАКРЫТЫЙ КОНТУР · 30 ДНЕЙ</p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,6.8rem)] font-black leading-[.88] tracking-[-.07em]">Красавица<br />Аналитик</h1>
          <p className="mt-5 max-w-2xl text-sm font-semibold leading-6 text-white/66">Продуктовая аналитика без cookies, IP, fingerprint и текста запросов. Последнее обновление: {formatUpdated(snapshot.updatedAt)}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/api/admin/export" className="apple-glass-button inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[var(--color-bordeaux)]"><Download className="size-4" /> CSV</a>
          <form action="/api/admin/logout" method="post"><button className="apple-glass-button inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-5 py-3 text-sm font-black text-white"><LogOut className="size-4" /> Выйти</button></form>
        </div>
      </header>

      <section className="mt-3 grid gap-px overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon }) => (
          <article key={label} className="bg-[var(--color-surface)] p-5 md:p-7">
            <div className="flex items-center justify-between gap-3"><p className="text-sm font-bold text-[var(--color-text-muted)]">{label}</p><Icon className="size-5 text-[var(--color-bordeaux)]" /></div>
            <p className="mt-8 text-[clamp(2.5rem,5vw,4.8rem)] font-black leading-none tracking-[-.07em]">{value}</p>
            <p className="mt-3 text-xs font-semibold text-[var(--color-text-soft)]">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[1.55fr_.65fr]">
        <article className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-bold text-[var(--color-bordeaux)]">Динамика</p><h2 className="mt-1 text-3xl font-black tracking-[-.04em] md:text-5xl">Спрос и результат</h2></div>
            <div className="flex gap-4 text-xs font-bold text-[var(--color-text-muted)]"><span className="before:mr-2 before:inline-block before:size-2 before:rounded-full before:bg-[var(--color-bordeaux)]">Просмотры</span><span className="before:mr-2 before:inline-block before:size-2 before:rounded-full before:bg-[var(--color-pink-strong)]">Подборы</span></div>
          </div>
          <TrendChart daily={snapshot.daily} />
        </article>

        <article className="rounded-[1rem] bg-[var(--color-bordeaux)] p-6 text-white md:p-8">
          <Sparkles className="size-7" />
          <h2 className="mt-8 text-3xl font-black tracking-[-.04em]">Воронка подбора</h2>
          <div className="mt-8 space-y-5">{funnel.map((item, index) => <FunnelRow key={item.label} {...item} base={funnel[0].value} index={index} />)}</div>
        </article>
      </section>

      <section className="mt-3 grid gap-3 lg:grid-cols-3">
        <Distribution title="Устройства" items={snapshot.rankings.devices} />
        <Distribution title="Темы" items={snapshot.rankings.themes} />
        <Distribution title="Направления" items={snapshot.rankings.modes} />
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[.8fr_1.2fr]">
        <article className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-7">
          <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-[var(--color-bordeaux)]">Качество</p><h2 className="mt-1 text-3xl font-black tracking-[-.04em]">Web Vitals</h2></div><Gauge className="size-7 text-[var(--color-bordeaux)]" /></div>
          <div className="mt-6 divide-y divide-[var(--color-border)]">
            {snapshot.vitals.map((vital) => <div key={vital.name} className="flex items-center justify-between py-4"><div><p className="font-black">{vital.name}</p><p className="text-xs text-[var(--color-text-soft)]">{vital.samples} замеров</p></div><p className="text-xl font-black">{vitalValue(vital.name, vital.average)}</p></div>)}
          </div>
        </article>

        <article className="overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="p-5 md:p-7"><p className="text-sm font-bold text-[var(--color-bordeaux)]">Автотаблица</p><h2 className="mt-1 text-3xl font-black tracking-[-.04em]">По дням</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="border-y border-[var(--color-border)] text-xs text-[var(--color-text-soft)]"><tr>{["Дата", "Просмотры", "Вовлечены", "Поиски", "Успех", "Средства", "Статьи", "Ошибки"].map((label) => <th key={label} className="px-4 py-3 font-bold">{label}</th>)}</tr></thead>
              <tbody>{[...snapshot.daily].reverse().map((day) => <tr key={day.date} className="border-b border-[var(--color-border)] last:border-0"><td className="px-4 py-3 font-black">{day.date.slice(5)}</td><td className="px-4 py-3">{day.events.page_view ?? 0}</td><td className="px-4 py-3">{day.events.engaged_visit ?? 0}</td><td className="px-4 py-3">{day.events.search_submit ?? 0}</td><td className="px-4 py-3">{day.events.search_success ?? 0}</td><td className="px-4 py-3">{day.productsShown ?? 0}</td><td className="px-4 py-3">{day.events.article_save ?? 0}</td><td className="px-4 py-3">{day.errors}</td></tr>)}</tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="mt-3 grid gap-3 lg:grid-cols-[1fr_2fr]">
        <article className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"><ShieldCheck className="size-7 text-[var(--color-bordeaux)]" /><h2 className="mt-6 text-2xl font-black">Контур приватности</h2><p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">События собираются всегда, но остаются агрегатами: без IP, геолокации, текста запросов, рекламных ID и постоянного visitor ID.</p></article>
        <article className="grid gap-px overflow-hidden rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3"><MiniRanking title="Страницы" items={snapshot.rankings.pages} /><MiniRanking title="Источники" items={snapshot.rankings.referrers} /><MiniRanking title="Браузеры" items={snapshot.rankings.browsers} /></article>
      </section>
    </main>
  );
}

function TrendChart({ daily }: { daily: Awaited<ReturnType<typeof getAnalyticsSnapshot>>["daily"] }) {
  if (!daily.length) return <div className="mt-8 grid h-72 place-items-center rounded-xl border border-dashed border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)]">Данные появятся после первых посещений.</div>;
  const width = 900; const height = 300; const inset = 20;
  const max = Math.max(1, ...daily.flatMap((day) => [day.events.page_view ?? 0, day.events.search_submit ?? 0]));
  const points = (key: string) => daily.map((day, index) => `${inset + (index / Math.max(1, daily.length - 1)) * (width - inset * 2)},${height - inset - ((day.events[key] ?? 0) / max) * (height - inset * 2)}`).join(" ");
  return <div className="mt-7 overflow-hidden"><svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" role="img" aria-label="График просмотров и поисков"><defs><linearGradient id="admin-area" x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--color-bordeaux)" stopOpacity=".28" /><stop offset="1" stopColor="var(--color-bordeaux)" stopOpacity="0" /></linearGradient></defs>{[.25,.5,.75].map((value) => <line key={value} x1={inset} x2={width-inset} y1={height*value} y2={height*value} stroke="var(--color-border)" />)}<polygon points={`${inset},${height-inset} ${points("page_view")} ${width-inset},${height-inset}`} fill="url(#admin-area)" /><polyline points={points("page_view")} fill="none" stroke="var(--color-bordeaux)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /><polyline points={points("search_submit")} fill="none" stroke="var(--color-pink-strong)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>;
}

function FunnelRow({ label, value, base, index }: { label: string; value: number; base: number; index: number }) {
  const ratio = base ? value / base : 0;
  return <div><div className="flex items-end justify-between gap-3"><p className="text-sm font-bold text-white/72"><span className="mr-2 text-white/36">0{index + 1}</span>{label}</p><p className="font-black">{compact.format(value)}</p></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[var(--color-pink)]" style={{ width: `${Math.max(value ? 4 : 0, ratio * 100)}%` }} /></div></div>;
}

function Distribution({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return <article className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-7"><p className="text-sm font-bold text-[var(--color-text-muted)]">{title}</p><div className="mt-6 space-y-4">{items.length ? items.slice(0, 5).map((item, index) => <div key={item.label}><div className="flex justify-between gap-3 text-sm"><span className="font-black">{displayLabel(item.label)}</span><span className="text-[var(--color-text-soft)]">{percent(total ? item.value / total : 0)}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-soft)]"><div className="h-full rounded-full bg-[var(--color-bordeaux)]" style={{ width: `${total ? item.value / total * 100 : 0}%`, opacity: 1 - index * .12 }} /></div></div>) : <p className="text-sm text-[var(--color-text-soft)]">Пока нет данных</p>}</div></article>;
}

function MiniRanking({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  return <div className="bg-[var(--color-surface)] p-5 md:p-6"><p className="font-black">{title}</p><div className="mt-5 space-y-3">{items.slice(0, 4).map((item) => <div key={item.label} className="flex justify-between gap-3 text-xs"><span className="truncate font-semibold text-[var(--color-text-muted)]">{displayLabel(item.label)}</span><strong>{item.value}</strong></div>)}</div></div>;
}

function AdminLogin({ error }: { error?: string }) {
  return <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] p-4 text-[var(--color-text)]"><section className="w-full max-w-lg rounded-[1.25rem] bg-[var(--color-bordeaux)] p-7 text-white shadow-[var(--shadow-soft)] md:p-10"><ShieldCheck className="size-10" /><p className="mt-10 text-xs font-bold tracking-[.18em] text-white/52">ТОЛЬКО ДЛЯ АДМИНИСТРАТОРА</p><h1 className="mt-3 text-5xl font-black leading-none tracking-[-.06em]">Красавица Аналитик</h1><form action="/api/admin/login" method="post" className="mt-8"><label className="block rounded-full border border-white/18 bg-white/10 px-5 py-4"><span className="sr-only">Пароль</span><input name="password" type="password" required autoComplete="current-password" placeholder="Пароль администратора" className="w-full bg-transparent font-bold text-white outline-none placeholder:text-white/42" /></label>{error ? <p className="mt-3 text-sm font-bold text-[#ffd0d6]">Пароль не принят.</p> : null}<button className="apple-glass-button mt-4 w-full rounded-full bg-white px-6 py-4 text-sm font-black text-[var(--color-bordeaux)]">Открыть дашборд</button></form></section></main>;
}

function percent(value: number) { return `${Math.round(value * 100)}%`; }
function duration(ms: number) { return ms ? `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} с` : "—"; }
function vitalValue(name: string, value: number) { if (!value) return "—"; return name === "CLS" ? value.toFixed(3) : `${Math.round(value)} мс`; }
function displayLabel(label: string) { return ({ skin: "Кожа", hair: "Волосы", perfume: "Парфюм", light: "Светлая", dark: "Тёмная", system: "Система", direct: "Прямые" } as Record<string, string>)[label] ?? label; }
function formatUpdated(value: string) { try { return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Moscow" }).format(new Date(value)); } catch { return value; } }
