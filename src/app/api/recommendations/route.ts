import { NextResponse } from "next/server";
import { fallbackRecommendation, isSearchMode, recommendBeauty } from "@/lib/beauty-engine";
import { isBeautyRelevantRequest } from "@/lib/beauty-relevance";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { query?: unknown; mode?: unknown };
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const mode = isSearchMode(body.mode) ? body.mode : "skin";

    if (query.length < 10) {
      return NextResponse.json({ error: "Опишите задачу чуть подробнее: цель, важные ограничения и бюджет, если он есть." }, { status: 400 });
    }
    if (!isBeautyRelevantRequest(query, mode)) {
      return NextResponse.json({ error: "Похоже, это не beauty-запрос. Напишите, что хотите подобрать для кожи, волос или какой аромат ищете." }, { status: 400 });
    }
    if (query.length > 1600) {
      return NextResponse.json({ error: "Сократите запрос до 1600 символов." }, { status: 413 });
    }

    try {
      return NextResponse.json(await recommendBeauty(query, mode), {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      console.error("Beauty recommendation pipeline failed", error instanceof Error ? error.message : error);
      return NextResponse.json(fallbackRecommendation(mode), {
        headers: { "Cache-Control": "no-store" },
      });
    }
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать запрос. Попробуйте ещё раз." }, { status: 400 });
  }
}
