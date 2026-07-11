"use client";

import { Heart, ImagePlus, PenLine, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

type PersonalPost = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image?: string;
  liked: boolean;
  createdAt: string;
};

const storageKey = "krasavitsa-personal-articles-v1";

export function BlogStudio() {
  const [posts, setPosts] = useState<PersonalPost[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Личный опыт");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string>();
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setPosts(JSON.parse(stored) as PersonalPost[]);
    } catch {
      setPosts([]);
    }
  }, []);

  const persist = (next: PersonalPost[]) => {
    setPosts(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const publish = () => {
    if (title.trim().length < 8 || content.trim().length < 80) {
      setNotice("Добавьте понятный заголовок и не менее 80 символов основного текста.");
      return;
    }
    const post: PersonalPost = {
      id: window.crypto.randomUUID(),
      title: title.trim(),
      category,
      excerpt: excerpt.trim() || content.trim().slice(0, 150),
      content: content.trim(),
      image,
      liked: false,
      createdAt: new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date()),
    };
    persist([post, ...posts]);
    trackAnalyticsEvent("article_save", "personal_article");
    setTitle("");
    setExcerpt("");
    setContent("");
    setImage(undefined);
    setNotice("Статья сохранена в вашем профиле на этом устройстве.");
  };

  const loadImage = (file?: File) => {
    if (!file || file.size > 2_500_000) {
      setNotice("Выберите изображение до 2,5 МБ.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : undefined);
    reader.readAsDataURL(file);
  };

  return (
    <section className="px-3 py-8 md:px-5 md:py-12">
      <div className="brand-panel grid gap-8 overflow-hidden rounded-[var(--radius-xxl)] p-5 shadow-[var(--shadow-soft)] md:grid-cols-[0.8fr_1.2fr] md:p-8">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <p className="text-xs font-black uppercase text-white/55">Личная редакция</p>
            <h2 className="mt-4 text-[clamp(2.6rem,5vw,5.4rem)] font-black leading-[0.92]">Напишите опыт, который поможет другим</h2>
            <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-white/68">Черновики и публикации сохраняются локально в вашем профиле. Никакие данные не отправляются без вашего действия.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-white/18 bg-white/10 p-5 backdrop-blur-2xl">
              <PenLine className="size-6" />
              <p className="mt-6 text-2xl font-black">Текст и обложка</p>
              <p className="mt-2 text-sm text-white/60">Полноценный материал, а не короткий комментарий.</p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-white/18 bg-white/10 p-5 backdrop-blur-2xl">
              <Heart className="size-6" />
              <p className="mt-6 text-2xl font-black">Реакции и контроль</p>
              <p className="mt-2 text-sm text-white/60">Можно отметить статью и удалить её в любой момент.</p>
            </div>
          </div>
        </div>
        <div className="liquid-glass rounded-[var(--radius-xl)] border border-white/18 bg-white/14 p-4 text-[var(--color-text)] backdrop-blur-3xl md:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Заголовок" value={title} onChange={setTitle} placeholder="Например: как я упростила уход" />
            <label className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white/38 p-4 backdrop-blur-2xl">
              <span className="text-xs font-black uppercase text-[var(--color-text-soft)]">Рубрика</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-3 w-full bg-transparent text-base font-black outline-none">
                {['Личный опыт', 'Уход', 'Составы', 'SPF', 'Парфюм'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <Field label="Краткое описание" value={excerpt} onChange={setExcerpt} placeholder="О чём этот материал" />
          <label className="mt-3 block rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white/38 p-4 backdrop-blur-2xl">
            <span className="text-xs font-black uppercase text-[var(--color-text-soft)]">Текст статьи</span>
            <textarea value={content} onChange={(event) => setContent(event.target.value)} className="mt-3 min-h-52 w-full resize-y bg-transparent text-base font-semibold leading-7 outline-none" placeholder="Расскажите о контексте, шагах и результате..." />
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="apple-glass-button inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/38 px-5 py-3 text-sm font-black">
              <ImagePlus className="size-5" /> Обложка
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => loadImage(event.target.files?.[0])} />
            </label>
            <button type="button" onClick={publish} className="apple-glass-button brand-action rounded-full px-6 py-4 text-sm font-black">Сохранить статью</button>
          </div>
          {image ? <div className="mt-4 h-40 rounded-[var(--radius-md)] bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} /> : null}
          {notice ? <p className="mt-4 text-sm font-bold text-[var(--color-text-muted)]">{notice}</p> : null}
        </div>
      </div>

      {posts.length ? (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {posts.map((post) => (
            <motion.article key={post.id} layout className="liquid-glass meaning-card overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/28 backdrop-blur-2xl">
              <div className="h-44 bg-[linear-gradient(135deg,var(--color-powder),var(--color-bordeaux))] bg-cover bg-center" style={post.image ? { backgroundImage: `url(${post.image})` } : undefined} />
              <div className="p-6">
                <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">{post.category} · {post.createdAt}</p>
                <h3 className="mt-3 text-3xl font-black leading-tight">{post.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{post.excerpt}</p>
                <p className="mt-5 line-clamp-4 text-base leading-7 text-[var(--color-text-muted)]">{post.content}</p>
                <div className="mt-6 flex gap-2">
                  <button type="button" onClick={() => { persist(posts.map((item) => item.id === post.id ? { ...item, liked: !item.liked } : item)); trackAnalyticsEvent("article_like", "personal_article"); }} className="apple-glass-button grid size-11 place-items-center rounded-full border border-[var(--color-border)] bg-white/34 text-[var(--color-bordeaux)]"><Heart className={`size-5 ${post.liked ? "fill-current" : ""}`} /></button>
                  <button type="button" onClick={() => { persist(posts.filter((item) => item.id !== post.id)); trackAnalyticsEvent("article_delete", "personal_article"); }} className="apple-glass-button grid size-11 place-items-center rounded-full border border-[var(--color-border)] bg-white/34 text-[var(--color-text-muted)]"><Trash2 className="size-5" /></button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white/38 p-4 backdrop-blur-2xl">
      <span className="text-xs font-black uppercase text-[var(--color-text-soft)]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 w-full bg-transparent text-base font-black outline-none placeholder:text-[var(--color-text-soft)]" placeholder={placeholder} />
    </label>
  );
}
