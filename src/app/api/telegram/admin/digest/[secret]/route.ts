import { NextResponse } from "next/server";
import { sendDailyAnalyticsDigest } from "@/lib/telegram-admin-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ secret: string }> };

function validSecret(secret: string) {
  const configured = process.env.TELEGRAM_ADMIN_BOT_SECRET;
  return Boolean(configured && secret && configured === secret);
}

export async function GET(_request: Request, context: RouteParams) {
  const { secret } = await context.params;
  if (!validSecret(secret)) return NextResponse.json({ ok: false }, { status: 404 });

  try {
    return NextResponse.json({ ok: true, ...(await sendDailyAnalyticsDigest()) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Telegram analytics digest failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
