import { NextResponse } from "next/server";
import { deleteArticle, toggleLike } from "@/lib/article-store";
import { getCurrentUserId } from "@/lib/user-auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  return (await deleteArticle((await params).id, userId)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Материал не найден." }, { status: 404 });
}

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  const article = await toggleLike((await params).id, userId);
  return article ? NextResponse.json({ article }) : NextResponse.json({ error: "Материал не найден." }, { status: 404 });
}
