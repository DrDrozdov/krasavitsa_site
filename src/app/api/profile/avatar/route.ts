import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/user-auth";
import { getUserDataRoot, setUserAvatar, toPublicUser } from "@/lib/user-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Сначала войдите в профиль." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("avatar");
  if (!(file instanceof File)) return NextResponse.json({ error: "Выберите изображение." }, { status: 400 });
  if (file.size > 1_500_000) return NextResponse.json({ error: "Изображение должно быть не больше 1,5 МБ." }, { status: 413 });
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const extension = extensions[file.type];
  if (!extension) return NextResponse.json({ error: "Поддерживаются JPG, PNG и WebP." }, { status: 415 });
  const fileName = `${userId}-${randomUUID()}.${extension}`;
  const directory = path.join(getUserDataRoot(), "avatars");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, fileName), Buffer.from(await file.arrayBuffer()));
  const user = await setUserAvatar(userId, `/api/profile/avatar/${fileName}`);
  return NextResponse.json({ user: user ? toPublicUser(user) : null });
}
