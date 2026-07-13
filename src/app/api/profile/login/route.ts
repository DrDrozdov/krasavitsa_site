import { NextResponse } from "next/server";
import { authIsConfigured, createUserSessionValue, setUserSession } from "@/lib/user-auth";
import { findUserByEmail, toPublicUser, verifyPassword } from "@/lib/user-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!authIsConfigured()) return NextResponse.json({ error: "Вход временно недоступен." }, { status: 503 });
  const body = (await request.json()) as { email?: string; password?: string };
  const user = await findUserByEmail(body.email ?? "");
  if (!user || !body.password || !verifyPassword(user, body.password)) return NextResponse.json({ error: "Неверная почта или пароль." }, { status: 401 });
  if (!user.emailVerifiedAt) return NextResponse.json({ error: "Подтвердите почту по ссылке из письма, затем войдите." }, { status: 403 });
  const response = NextResponse.json({ user: toPublicUser(user) });
  setUserSession(response, createUserSessionValue(user.id));
  return response;
}
