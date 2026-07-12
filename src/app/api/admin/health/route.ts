import { NextResponse } from "next/server";
import { adminConfiguration } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = adminConfiguration();
  return NextResponse.json({
    ok: admin.passwordConfigured && admin.sessionConfigured,
    admin,
    analyticsDataDirectory: Boolean(process.env.ANALYTICS_DATA_DIR),
    telegram: {
      tokenConfigured: Boolean(process.env.TELEGRAM_ADMIN_BOT_TOKEN),
      secretConfigured: Boolean(process.env.TELEGRAM_ADMIN_BOT_SECRET),
      adminIdsConfigured: Boolean(process.env.TELEGRAM_ADMIN_IDS),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
