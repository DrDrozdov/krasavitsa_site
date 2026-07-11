import { NextResponse } from "next/server";
import { buildMessagePayload, sendTelegramMessage, type TelegramUpdate } from "@/lib/telegram-admin-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{
    secret: string;
  }>;
};

function isValidSecret(secret: string) {
  const configuredSecret = process.env.TELEGRAM_ADMIN_BOT_SECRET;
  return Boolean(configuredSecret && secret && configuredSecret === secret);
}

export async function GET(_request: Request, context: RouteParams) {
  const { secret } = await context.params;

  if (!isValidSecret(secret)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    service: "krasavitsa-telegram-admin-bot",
  });
}

export async function POST(request: Request, context: RouteParams) {
  const { secret } = await context.params;

  if (!isValidSecret(secret)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const update = (await request.json()) as TelegramUpdate;
    const messagePayload = await buildMessagePayload(update);

    if (messagePayload) {
      await sendTelegramMessage(messagePayload);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
