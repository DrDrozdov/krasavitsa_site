import { NextResponse } from "next/server";
import { analyzeInciText } from "@/lib/inci-analyzer";
import { readLimitedJson, trustedInciMutationOrigin } from "@/lib/inci-security";
import { INCI_ROUTINE_LIMIT, INCI_TEXT_LIMIT, type InciSource } from "@/lib/inci-types";
import { getCurrentUserId } from "@/lib/user-auth";
import { saveInciAnalysis } from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAVE_BODY_LIMIT = 32 * 1024;

function json(data: unknown, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export async function POST(request: Request) {
  if (!trustedInciMutationOrigin(request)) {
    return json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }
  const userId = await getCurrentUserId();
  if (!userId) return json({ error: "Войдите в Beauty ID, чтобы сохранить разбор." }, { status: 401 });

  try {
    const body = await readLimitedJson<{
      inciText?: unknown;
      routineText?: unknown;
      source?: unknown;
      label?: unknown;
    }>(request, SAVE_BODY_LIMIT);
    const inciText = typeof body.inciText === "string" ? body.inciText.trim() : "";
    const routineText = typeof body.routineText === "string" ? body.routineText.trim() : "";
    const source: InciSource = body.source === "photo" ? "photo" : "text";
    const label = typeof body.label === "string" ? body.label.trim().slice(0, 100) : "";

    if (!inciText || inciText.length > INCI_TEXT_LIMIT) {
      return json({ error: "Текст состава пустой или слишком длинный." }, { status: 413 });
    }
    if (routineText.length > INCI_ROUTINE_LIMIT) {
      return json({ error: "Описание текущего ухода слишком длинное." }, { status: 413 });
    }

    const analysis = analyzeInciText(inciText, routineText, source);
    const saved = await saveInciAnalysis(userId, analysis, { label, routineText });
    if (!saved) return json({ error: "Beauty ID не найден." }, { status: 404 });
    return json({ saved: saved[0], savedCount: saved.length });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "BODY_TOO_LARGE") return json({ error: "Запрос на сохранение слишком большой." }, { status: 413 });
    if (code === "INCI_TOO_SHORT") return json({ error: "В разборе недостаточно компонентов для сохранения." }, { status: 422 });
    return json({ error: "Не удалось сохранить разбор в Beauty ID." }, { status: 400 });
  }
}
