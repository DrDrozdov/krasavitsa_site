"use client";

import Link from "next/link";
import Image from "next/image";
import { Camera, Heart, History, LogOut, ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { FormEvent, useEffect, useState } from "react";

type User = { id: string; email: string; nickname: string; avatarUrl?: string; createdAt: string };
type Library = {
  favorites: Array<{ id: string; name: string; category: string; image?: string }>;
  history: Array<{ id: string; query: string; mode: string; createdAt: string }>;
  consents: { privacy: boolean; terms: boolean; analytics: boolean; updatedAt: string };
};
type Mode = "register" | "login";

export function ProfileDemo() {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<Mode>("register");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [library, setLibrary] = useState<Library | null>(null);

  useEffect(() => {
    void fetch("/api/profile/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { user?: User | null }) => setUser(data.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    void fetch("/api/profile/library", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data: Library | null) => setLibrary(data));
  }, [user]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(`/api/profile/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, acceptedPrivacy: form.get("acceptedPrivacy") === "on", acceptedTerms: form.get("acceptedTerms") === "on" }),
    });
    const data = (await response.json()) as { user?: User; error?: string };
    if (!response.ok || !data.user) return setMessage(data.error ?? "Не удалось сохранить профиль.");
    setUser(data.user);
    setMessage(mode === "register" ? "Профиль создан." : "Вы вошли в профиль.");
  };

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    const form = new FormData();
    form.set("avatar", file);
    const response = await fetch("/api/profile/avatar", { method: "POST", body: form });
    const data = (await response.json()) as { user?: User; error?: string };
    if (data.user) setUser(data.user);
    setMessage(data.error ?? "Аватар обновлён.");
  };

  const logout = async () => {
    await fetch("/api/profile/logout", { method: "POST" });
    setUser(null);
    setLibrary(null);
    setMode("login");
    setMessage("Вы вышли из профиля.");
  };

  const deleteAccount = async () => {
    if (!window.confirm("Удалить профиль и данные аккаунта? Это действие нельзя отменить.")) return;
    const response = await fetch("/api/profile/me", { method: "DELETE" });
    if (!response.ok) return setMessage("Не удалось удалить профиль.");
    setUser(null);
    setLibrary(null);
    setMode("register");
    setMessage("Профиль удалён.");
  };

  const setAnalyticsConsent = async (analytics: boolean) => {
    const response = await fetch("/api/profile/library", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "consents", consents: { analytics } }),
    });
    const data = await response.json().catch(() => ({})) as { consents?: Library["consents"] };
    if (data.consents) {
      setLibrary((current) => current ? { ...current, consents: data.consents! } : current);
      document.cookie = `krasavitsa_cookie_consent=${analytics ? "all" : "essential"}; Path=/; Max-Age=31536000; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent("krasavitsa-cookie-consent", { detail: analytics ? "all" : "essential" }));
    }
  };

  if (loading) return <div className="mx-auto min-h-[520px] max-w-[1180px] animate-pulse rounded-[var(--radius-xxl)] bg-[var(--color-glass)]" />;

  return (
    <section className="px-3 pb-14 pt-6 md:px-5 md:pb-24 md:pt-12">
      <div className="mx-auto grid max-w-[1180px] gap-3 md:grid-cols-[0.88fr_1.12fr]">
        <div className="brand-panel flex min-h-[500px] flex-col justify-between rounded-[var(--radius-xxl)] border border-white/18 p-6 text-white shadow-[var(--shadow-soft)] md:p-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/48">Личный контекст</p>
            <h1 className="mt-6 text-[clamp(3rem,6vw,6.4rem)] font-black leading-[0.88]">Профиль, который помнит главное</h1>
          </div>
          <div className="mt-16 grid gap-4 text-sm font-semibold leading-6 text-white/68">
            <p>Аккаунт и аватар сохраняются на сервере проекта в России. Текст AI-запросов не связывается с email профиля.</p>
            <div className="flex items-center gap-3"><ShieldCheck className="size-5" /><span>Пароль хранится только как криптографический хеш.</span></div>
          </div>
        </div>

        <div className="liquid-glass rounded-[var(--radius-xxl)] border border-[var(--color-border)] bg-[var(--color-glass)] p-5 shadow-[var(--shadow-card)] backdrop-blur-3xl md:p-8">
          <AnimatePresence mode="wait">
            {user ? (
              <motion.div key="account" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex min-h-[450px] flex-col">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <label className="group relative grid size-32 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-powder-light)]">
                    {user.avatarUrl ? <Image src={user.avatarUrl} alt="Аватар профиля" fill unoptimized className="object-cover" /> : <UserRound className="size-12 text-[var(--color-bordeaux)]" />}
                    <span className="absolute inset-0 grid place-items-center bg-black/0 text-transparent transition group-hover:bg-black/40 group-hover:text-white"><Camera className="size-6" /></span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void uploadAvatar(event.target.files?.[0])} />
                  </label>
                  <div><p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Ваш профиль</p><h2 className="mt-2 text-4xl font-black">{user.nickname}</h2><p className="mt-2 font-semibold text-[var(--color-text-muted)]">{user.email}</p></div>
                </div>
                <div className="mt-12 grid gap-3 sm:grid-cols-2">
                  <Info label="Хранение" value="Российский сервер" />
                  <Info label="Создан" value={new Date(user.createdAt).toLocaleDateString("ru-RU")} />
                  <Info label="Следующий шаг" value="Заполнить параметры ухода" />
                  <Info label="Изображение" value={user.avatarUrl ? "Аватар добавлен" : "Можно добавить JPG, PNG или WebP"} />
                </div>
                {library ? <ProfileLibrary library={library} onAnalyticsChange={setAnalyticsConsent} /> : null}
                {message ? <p className="mt-5 text-sm font-semibold text-[var(--color-text-muted)]">{message}</p> : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-8">
                  <button type="button" onClick={() => void logout()} className="apple-glass-button flex h-12 w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/40 px-5 text-sm font-black"><LogOut className="size-4" />Выйти</button>
                  <button type="button" onClick={() => void deleteAccount()} className="h-12 rounded-full px-5 text-sm font-black text-[var(--color-text-soft)] transition hover:bg-[var(--color-bordeaux)] hover:text-white">Удалить профиль</button>
                </div>
              </motion.div>
            ) : (
              <motion.div key={mode} initial={{ opacity: 0, y: 18, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -12 }}>
                <div className="flex gap-2">
                  <ModeButton active={mode === "register"} onClick={() => setMode("register")}>Регистрация</ModeButton>
                  <ModeButton active={mode === "login"} onClick={() => setMode("login")}>Войти</ModeButton>
                </div>
                <h2 className="mt-10 text-4xl font-black leading-none">{mode === "register" ? "Создать профиль" : "Вернуться в профиль"}</h2>
                <form onSubmit={submit} className="mt-8 grid gap-3">
                  {mode === "register" ? <Field name="nickname" label="Никнейм" autoComplete="nickname" minLength={2} /> : null}
                  <Field name="email" label="Почта" type="email" autoComplete="email" />
                  <Field name="password" label="Пароль" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={10} />
                  {mode === "register" ? (
                    <div className="mt-2 grid gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/24 p-4">
                      <Consent name="acceptedPrivacy">Я принимаю <Link href="/privacy">политику конфиденциальности</Link>.</Consent>
                      <Consent name="acceptedTerms">Я принимаю <Link href="/terms">пользовательское соглашение</Link>.</Consent>
                    </div>
                  ) : null}
                  {message ? <p className="mt-2 text-sm font-semibold text-[var(--color-bordeaux)]">{message}</p> : null}
                  <button type="submit" className="apple-glass-button brand-action mt-4 h-14 rounded-full px-7 text-base font-black text-white">{mode === "register" ? "Создать профиль" : "Войти"}</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ProfileLibrary({ library, onAnalyticsChange }: { library: Library; onAnalyticsChange: (next: boolean) => Promise<void> }) {
  return (
    <div className="mt-8 grid gap-3 lg:grid-cols-3">
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/26 p-4 backdrop-blur-2xl">
        <div className="flex items-center gap-2"><Heart className="size-4 text-[var(--color-bordeaux)]" /><p className="text-sm font-black">Избранное</p></div>
        <p className="mt-3 text-xs font-semibold text-[var(--color-text-muted)]">{library.favorites.length ? library.favorites.map((item) => item.name).slice(0, 2).join(" · ") : "Сохраняйте средства из готовых подборок."}</p>
      </section>
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/26 p-4 backdrop-blur-2xl">
        <div className="flex items-center gap-2"><History className="size-4 text-[var(--color-bordeaux)]" /><p className="text-sm font-black">История подборов</p></div>
        <p className="mt-3 text-xs font-semibold text-[var(--color-text-muted)]">{library.history.length ? `${library.history.length} сохранённых сценария` : "Первый готовый подбор появится здесь."}</p>
      </section>
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/26 p-4 backdrop-blur-2xl">
        <div className="flex items-center gap-2"><SlidersHorizontal className="size-4 text-[var(--color-bordeaux)]" /><p className="text-sm font-black">Согласия</p></div>
        <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 text-xs font-semibold text-[var(--color-text-muted)]">
          Аналитика посещений
          <input type="checkbox" checked={library.consents.analytics} onChange={(event) => void onAnalyticsChange(event.target.checked)} className="size-4 accent-[var(--color-bordeaux)]" />
        </label>
        <p className="mt-2 text-[11px] leading-4 text-[var(--color-text-soft)]">Обязательные согласия приняты при регистрации.</p>
      </section>
    </div>
  );
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`rounded-full border px-5 py-3 text-sm font-black transition ${active ? "border-transparent bg-[var(--color-bordeaux)] text-white" : "border-[var(--color-border)] bg-white/32"}`}>{children}</button>;
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/34 p-4 backdrop-blur-xl"><span className="text-xs font-black uppercase text-[var(--color-text-soft)]">{label}</span><input required {...props} className="mt-2 h-10 w-full bg-transparent text-lg font-bold outline-none" /></label>;
}

function Consent({ name, children }: { name: string; children: React.ReactNode }) {
  return <label className="flex items-start gap-3 text-sm font-semibold leading-5 text-[var(--color-text-muted)]"><input required name={name} type="checkbox" className="mt-0.5 size-5 accent-[var(--color-bordeaux)]" /><span className="[&_a]:font-black [&_a]:underline">{children}</span></label>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/30 p-4"><p className="text-xs font-black uppercase text-[var(--color-text-soft)]">{label}</p><p className="mt-3 text-lg font-black">{value}</p></div>;
}
