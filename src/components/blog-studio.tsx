"use client";

import { ArrowRight, Heart, ImagePlus, MessageCircle, PenLine, Save, Send, Trash2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

type PersonalPost = {
  id: string; title: string; category: string; excerpt: string; content: string; image?: string; likes: string[];
  comments: Array<{ id: string; author: string; text: string; createdAt: string }>;
  status?: "published" | "pending"; authorId?: string; createdAt: string;
};

const draftKey = "krasavitsa_article_draft_v2";

export function BlogStudio() {
  const [posts, setPosts] = useState<PersonalPost[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Личный опыт");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string>();
  const [notice, setNotice] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { void fetch("/api/articles", { cache: "no-store" }).then((response) => response.json()).then((data: { articles?: PersonalPost[] }) => setPosts(data.articles ?? [])); }, []);

  useEffect(() => {
    if (!composerOpen) return;
    const body = document.body; const scrollY = window.scrollY;
    body.style.position = "fixed"; body.style.inset = `-${scrollY}px 0 0`; body.style.width = "100%";
    closeRef.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setComposerOpen(false); };
    window.addEventListener("keydown", close);
    return () => { window.removeEventListener("keydown", close); body.style.position = ""; body.style.inset = ""; body.style.width = ""; window.scrollTo(0, scrollY); };
  }, [composerOpen]);

  const openComposer = () => {
    setComposerOpen(true); setNotice(""); trackAnalyticsEvent("article_create_start", "journal_studio");
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) ?? "null") as { title?: string; category?: string; excerpt?: string; content?: string; image?: string } | null;
      if (saved) { setTitle(saved.title ?? ""); setCategory(saved.category ?? "Личный опыт"); setExcerpt(saved.excerpt ?? ""); setContent(saved.content ?? ""); setImage(saved.image); setNotice("Черновик восстановлен на этом устройстве."); }
    } catch { /* Ignore a malformed local draft. */ }
  };

  const saveDraft = () => {
    localStorage.setItem(draftKey, JSON.stringify({ title, category, excerpt, content, image }));
    setNotice("Черновик сохранён на этом устройстве.");
    trackAnalyticsEvent("article_draft_save", "journal_studio");
  };

  const replacePost = (updated: PersonalPost) => setPosts((current) => current.map((post) => post.id === updated.id ? updated : post));

  const publish = async () => {
    if (title.trim().length < 8 || content.trim().length < 80) { setNotice("Добавьте понятный заголовок и не менее 80 символов основного текста."); return; }
    const response = await fetch("/api/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, category, excerpt, content, image }) });
    const data = await response.json().catch(() => ({})) as { article?: PersonalPost; error?: string };
    if (!response.ok || !data.article) { setNotice(data.error ?? "Не удалось сохранить статью. Войдите в профиль и попробуйте снова."); return; }
    if (data.article.status === "published") setPosts((current) => [data.article!, ...current]);
    trackAnalyticsEvent("article_save", "journal_studio", { result: "success" });
    localStorage.removeItem(draftKey); setTitle(""); setExcerpt(""); setContent(""); setImage(undefined);
    setNotice(data.article.status === "published" ? "Статья опубликована." : "Материал отправлен на проверку.");
    window.setTimeout(() => setComposerOpen(false), 900);
  };

  const toggleLike = async (post: PersonalPost) => { const response = await fetch(`/api/articles/${post.id}`, { method: "PATCH" }); const data = await response.json().catch(() => ({})) as { article?: PersonalPost; error?: string }; if (data.article) replacePost(data.article); else setNotice(data.error ?? "Войдите в профиль, чтобы оставить реакцию."); };
  const deletePost = async (post: PersonalPost) => { const response = await fetch(`/api/articles/${post.id}`, { method: "DELETE" }); if (response.ok) setPosts((current) => current.filter((item) => item.id !== post.id)); };
  const addComment = async (post: PersonalPost) => { const text = commentDrafts[post.id]?.trim(); if (!text) return; const response = await fetch(`/api/articles/${post.id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) }); const data = await response.json().catch(() => ({})) as { article?: PersonalPost; error?: string }; if (data.article) { replacePost(data.article); setCommentDrafts((current) => ({ ...current, [post.id]: "" })); } else setNotice(data.error ?? "Не удалось отправить комментарий."); };
  const deleteComment = async (post: PersonalPost, commentId: string) => { const response = await fetch(`/api/articles/${post.id}/comments`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ commentId }) }); const data = await response.json().catch(() => ({})) as { article?: PersonalPost }; if (data.article) replacePost(data.article); };

  const loadImage = (file?: File) => {
    if (!file || file.size > 2_500_000) { setNotice("Выберите изображение до 2,5 МБ."); return; }
    const reader = new FileReader(); reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : undefined); reader.readAsDataURL(file);
  };

  return <section className="journal-studio section-shell" id="write">
    <div className="journal-studio-invite"><div><p>Открытая редакция / ваш голос</p><h2>Есть опыт,<br />который стоит<br /><em>сохранить?</em></h2></div><div><p>Напишите полноценный материал с обложкой. Он сохранится в профиле и после автоматической проверки появится в журнале.</p><button type="button" onClick={openComposer} className="apple-glass-button"><PenLine />Создать статью<ArrowRight /></button></div></div>

    {posts.length ? <div className="reader-dispatches"><div className="reader-dispatches-title"><span>Материалы сообщества</span><strong>{posts.length.toString().padStart(2, "0")}</strong></div>{posts.map((post) => <motion.article key={post.id} layout className="reader-dispatch"><div className="reader-dispatch-cover" style={post.image ? { backgroundImage: `url(${post.image})` } : undefined} /><div><p>{post.category} · {new Date(post.createdAt).toLocaleDateString("ru-RU")}</p><h3>{post.title}</h3><span>{post.excerpt || post.content.slice(0, 180)}</span></div><div className="reader-dispatch-actions"><button type="button" onClick={() => { void toggleLike(post); trackAnalyticsEvent("article_like", "article"); }}><Heart className={post.likes.length ? "fill-current" : ""} />{post.likes.length}</button><button type="button" onClick={() => { void deletePost(post); trackAnalyticsEvent("article_delete", "article"); }} aria-label="Удалить"><Trash2 /></button></div><div className="reader-comments"><p><MessageCircle /> {post.comments.length} комментариев</p>{post.comments.slice(-2).map((comment) => <div key={comment.id}><span><strong>{comment.author}</strong> {comment.text}</span><button type="button" onClick={() => void deleteComment(post, comment.id)}>Удалить</button></div>)}<label><input value={commentDrafts[post.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Добавить комментарий" /><button type="button" onClick={() => void addComment(post)} aria-label="Отправить"><Send /></button></label></div></motion.article>)}</div> : null}

    {mounted ? createPortal(<AnimatePresence>{composerOpen ? <motion.div className="article-composer-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button className="article-composer-backdrop" aria-label="Закрыть редактор" onClick={() => setComposerOpen(false)} /><motion.section role="dialog" aria-modal="true" aria-labelledby="composer-title" className="article-composer" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: .985, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, y: 14, scale: .99 }} transition={{ duration: reduceMotion ? 0 : .28, ease: [0.16, 1, 0.3, 1] }}>
      <header><div><span>KRASAVITSA · OPEN EDITION</span><h2 id="composer-title">Новая статья</h2></div><button ref={closeRef} type="button" onClick={() => setComposerOpen(false)} aria-label="Закрыть"><X /></button></header>
      <div className="article-composer-grid"><div className="article-composer-main"><EditorField label="Заголовок" value={title} onChange={setTitle} placeholder="Ясный вопрос или ваш главный вывод" large /><div className="editor-meta"><EditorField label="Краткое описание" value={excerpt} onChange={setExcerpt} placeholder="Два предложения для обложки" /><label><span>Рубрика</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{["Личный опыт", "Уход", "Составы", "SPF", "Парфюм"].map((item) => <option key={item}>{item}</option>)}</select></label></div><label className="editor-body"><span>Текст статьи</span><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Начните с контекста. Затем расскажите о шагах, наблюдениях и результате…" /></label></div><aside className="article-composer-side"><div className="editor-cover" style={image ? { backgroundImage: `url(${image})` } : undefined}><label><ImagePlus />{image ? "Заменить обложку" : "Добавить обложку"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => loadImage(event.target.files?.[0])} /></label></div><div className="editor-count"><span>{content.trim() ? content.trim().split(/\s+/).length : 0}</span><p>слов · минимум 80 символов</p></div><p className="editor-notice">{notice || "Черновик хранится только на этом устройстве. Публикация требует входа в профиль."}</p></aside></div>
      <footer><button type="button" onClick={saveDraft} className="apple-glass-button editor-draft"><Save />Сохранить черновик</button><button type="button" onClick={() => void publish()} className="apple-glass-button editor-publish">Отправить в журнал<ArrowRight /></button></footer>
    </motion.section></motion.div> : null}</AnimatePresence>, document.body) : null}
  </section>;
}

function EditorField({ label, value, onChange, placeholder, large = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; large?: boolean }) {
  return <label className={large ? "editor-field editor-field-large" : "editor-field"}><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}
