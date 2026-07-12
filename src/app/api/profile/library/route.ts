import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/user-auth";
import { getUserLibrary, saveRecommendationHistory, toggleFavorite, updateUserConsents } from "@/lib/user-store";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Требуется вход в профиль." }, { status: 401 });
  const library = await getUserLibrary(userId);
  return NextResponse.json(library ?? { error: "Профиль не найден." }, { status: library ? 200 : 404 });
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Требуется вход в профиль." }, { status: 401 });
  try {
    const body = await request.json() as { action?: string; product?: Record<string, unknown>; history?: Record<string, unknown>; consents?: Record<string, unknown> };
    if (body.action === "favorite") {
      const favorites = await toggleFavorite(userId, body.product ?? {});
      return favorites ? NextResponse.json({ favorites }) : NextResponse.json({ error: "Не удалось сохранить средство." }, { status: 400 });
    }
    if (body.action === "history") {
      const history = await saveRecommendationHistory(userId, body.history ?? {});
      return history ? NextResponse.json({ history }) : NextResponse.json({ error: "Не удалось сохранить подборку." }, { status: 400 });
    }
    if (body.action === "consents") {
      const consents = await updateUserConsents(userId, body.consents ?? {});
      return consents ? NextResponse.json({ consents }) : NextResponse.json({ error: "Не удалось обновить согласия." }, { status: 400 });
    }
    return NextResponse.json({ error: "Неизвестное действие." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Не удалось обработать запрос." }, { status: 400 });
  }
}
