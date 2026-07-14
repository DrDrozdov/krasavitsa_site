import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sendDailyAnalyticsDigest } from "@/lib/telegram-admin-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorized(request: Request) {
  const configured = process.env.TELEGRAM_ADMIN_BOT_SECRET ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  return configured.length >= 32 && safeEqual(supplied, configured);
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 404 });

  try {
    return NextResponse.json(
      { ok: true, ...(await sendDailyAnalyticsDigest()) },
      { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } },
    );
  } catch (error) {
    console.error("Telegram analytics digest failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
