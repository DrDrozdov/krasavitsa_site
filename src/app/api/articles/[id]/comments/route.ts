import { NextResponse } from "next/server";
import { addComment, deleteComment } from "@/lib/article-store";
import { getCurrentUserId } from "@/lib/user-auth";
import { findUserById } from "@/lib/user-store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId(); const user = userId ? await findUserById(userId) : null;
  if (!user) return NextResponse.json({ error: "Чтобы комментировать, войдите в профиль." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { text?: unknown };
  const article = await addComment((await params).id, { id: user.id, nickname: user.nickname }, body.text);
  return article ? NextResponse.json({ article }) : NextResponse.json({ error: "Комментарий не прошёл модерацию." }, { status: 400 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId(); if (!userId) return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { commentId?: string };
  const article = body.commentId ? await deleteComment((await params).id, body.commentId, userId) : null;
  return article ? NextResponse.json({ article }) : NextResponse.json({ error: "Комментарий не найден." }, { status: 404 });
}
