import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Comment = { id: string; authorId: string; author: string; text: string; createdAt: string };
export type Article = { id: string; authorId: string; author: string; title: string; category: string; excerpt: string; content: string; image?: string; status: "published" | "pending"; createdAt: string; likes: string[]; comments: Comment[] };
type ArticleState = { articles: Article[] };

const root = process.env.USER_DATA_DIR ?? process.env.ANALYTICS_DATA_DIR ?? path.join(process.cwd(), ".data");
const file = path.join(root, "articles.json");
let queue = Promise.resolve();

async function readState(): Promise<ArticleState> {
  try { return JSON.parse(await readFile(file, "utf8")) as ArticleState; } catch { return { articles: [] }; }
}
async function writeState(state: ArticleState) { await mkdir(root, { recursive: true }); await writeFile(file, JSON.stringify(state, null, 2), "utf8"); }

const blocked = [/\b(казино|ставк|крипт|заработок|эротик|порно|наркотик)\b/i, /(https?:\/\/){2,}/i];
function clean(value: unknown, limit: number) { return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, limit) : ""; }
function moderationStatus(title: string, content: string): Article["status"] {
  return title.length >= 8 && content.length >= 120 && !blocked.some((rule) => rule.test(`${title} ${content}`)) ? "published" : "pending";
}

export async function listArticles() { return (await readState()).articles.filter((article) => article.status === "published").slice(0, 30); }

export async function createArticle(author: { id: string; nickname: string }, input: Record<string, unknown>) {
  const title = clean(input.title, 150); const category = clean(input.category, 60) || "Личный опыт"; const content = clean(input.content, 12000); const excerpt = clean(input.excerpt, 360) || content.slice(0, 220);
  const rawImage = clean(input.image, 1_500_000);
  if (title.length < 8 || content.length < 120) return { article: null, error: "Добавьте заголовок и содержательный текст не короче 120 символов." };
  const image = rawImage.startsWith("data:image/") ? rawImage : undefined;
  const article: Article = { id: randomUUID(), authorId: author.id, author: author.nickname, title, category, excerpt, content, image, status: moderationStatus(title, content), createdAt: new Date().toISOString(), likes: [], comments: [] };
  const task = queue.then(async () => { const state = await readState(); state.articles.unshift(article); await writeState(state); }); queue = task.catch(() => undefined); await task;
  return { article, error: null };
}

export async function deleteArticle(articleId: string, userId: string) {
  let deleted = false; const task = queue.then(async () => { const state = await readState(); const before = state.articles.length; state.articles = state.articles.filter((article) => !(article.id === articleId && article.authorId === userId)); deleted = before !== state.articles.length; if (deleted) await writeState(state); }); queue = task.catch(() => undefined); await task; return deleted;
}

export async function toggleLike(articleId: string, userId: string) {
  let article: Article | null = null; const task = queue.then(async () => { const state = await readState(); const target = state.articles.find((item) => item.id === articleId); if (!target || target.status !== "published") return; target.likes = target.likes.includes(userId) ? target.likes.filter((id) => id !== userId) : [...target.likes, userId]; article = target; await writeState(state); }); queue = task.catch(() => undefined); await task; return article;
}

export async function addComment(articleId: string, author: { id: string; nickname: string }, rawText: unknown) {
  const text = clean(rawText, 1000); if (text.length < 2 || blocked.some((rule) => rule.test(text))) return null;
  let article: Article | null = null; const task = queue.then(async () => { const state = await readState(); const target = state.articles.find((item) => item.id === articleId && item.status === "published"); if (!target) return; target.comments.push({ id: randomUUID(), authorId: author.id, author: author.nickname, text, createdAt: new Date().toISOString() }); article = target; await writeState(state); }); queue = task.catch(() => undefined); await task; return article;
}

export async function deleteComment(articleId: string, commentId: string, userId: string) {
  let article: Article | null = null; const task = queue.then(async () => { const state = await readState(); const target = state.articles.find((item) => item.id === articleId); if (!target) return; const next = target.comments.filter((comment) => !(comment.id === commentId && comment.authorId === userId)); if (next.length === target.comments.length) return; target.comments = next; article = target; await writeState(state); }); queue = task.catch(() => undefined); await task; return article;
}
