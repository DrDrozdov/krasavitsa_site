import { NextResponse } from "next/server";
import { clearUserSession, getCurrentUserId } from "@/lib/user-auth";
import { deleteUser, findUserById, toPublicUser } from "@/lib/user-store";

export async function GET() {
  const userId = await getCurrentUserId();
  const user = userId ? await findUserById(userId) : null;
  return NextResponse.json({ user: user ? toPublicUser(user) : null });
}

export async function DELETE() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Профиль не найден." }, { status: 401 });
  await deleteUser(userId);
  const response = NextResponse.json({ ok: true });
  clearUserSession(response);
  return response;
}
