import { NextResponse } from "next/server";
import { createUserSessionValue, setUserSession } from "@/lib/user-auth";
import { publicUrl } from "@/lib/public-url";
import { verifyUserEmail } from "@/lib/user-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const user = token.length >= 20 ? await verifyUserEmail(token) : null;
  if (!user) return NextResponse.redirect(publicUrl(request, "/profile?verification=invalid"), 303);
  const response = NextResponse.redirect(publicUrl(request, "/profile?verification=success"), 303);
  setUserSession(response, createUserSessionValue(user.id));
  return response;
}
