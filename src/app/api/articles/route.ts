import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/user-auth";
import { createArticle, listArticles } from "@/lib/article-store";
import { findUserById } from "@/lib/user-store";

export async function GET() { return NextResponse.json({ articles: await listArticles() }); }

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  const user = userId ? await findUserById(userId) : null;
  if (!user) return NextResponse.json({ error: "Чтобы опубликовать материал, войдите в профиль." }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const result = await createArticle({ id: user.id, nickname: user.nickname }, body);
    if (!result.article) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ article: result.article }, { status: 201 });
  } catch { return NextResponse.json({ error: "Не удалось обработать публикацию." }, { status: 400 }); }
}
