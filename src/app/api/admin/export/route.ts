import { analyticsToCsv, getAnalyticsSnapshot } from "@/lib/analytics-store";
import { isAdminSession } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminSession())) return new Response("Not found", { status: 404 });
  const csv = analyticsToCsv(await getAnalyticsSnapshot(365));
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="krasavitsa-analytics-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
