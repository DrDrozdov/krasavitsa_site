import { NextResponse } from "next/server";
import { isSearchMode } from "@/lib/beauty-engine";
import { isBeautyRelevantRequest } from "@/lib/beauty-relevance";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { query?: unknown; mode?: unknown };
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const mode = isSearchMode(body.mode) ? body.mode : "skin";
    return NextResponse.json({ relevant: isBeautyRelevantRequest(query, mode) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ relevant: false }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
