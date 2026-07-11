import { NextResponse } from "next/server";
import { recordAnalyticsEvent, type AnalyticsEvent } from "@/lib/analytics-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 4096) return NextResponse.json({ ok: false }, { status: 413 });
    const event = (await request.json()) as AnalyticsEvent;
    const accepted = await recordAnalyticsEvent(event);
    return NextResponse.json({ ok: accepted });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
