import { NextResponse } from "next/server";
import { authIsConfigured, createUserSessionValue, setUserSession } from "@/lib/user-auth";
import { createUser, toPublicUser } from "@/lib/user-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!authIsConfigured()) return NextResponse.json({ error: "Регистрация временно недоступна: не настроен секрет сессии." }, { status: 503 });
  const body = (await request.json()) as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!body.acceptedPrivacy || !body.acceptedTerms) return NextResponse.json({ error: "Нужно принять оба документа." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Проверьте адрес электронной почты." }, { status: 400 });
  if (!/^[\p{L}\p{N}_. -]{2,32}$/u.test(nickname)) return NextResponse.json({ error: "Ник должен содержать от 2 до 32 символов." }, { status: 400 });
  if (password.length < 10 || password.length > 128) return NextResponse.json({ error: "Пароль должен содержать не меньше 10 символов." }, { status: 400 });
  const result = await createUser({ email, nickname, password });
  if (result.duplicate || !result.user) return NextResponse.json({ error: "Профиль с такой почтой уже существует." }, { status: 409 });
  const createdUser = result.user;
  const response = NextResponse.json({ user: toPublicUser(createdUser) });
  setUserSession(response, createUserSessionValue(createdUser.id));
  return response;
}
