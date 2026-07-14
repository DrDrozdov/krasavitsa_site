import { NextResponse } from "next/server";
import { adminAccessCookieName, createAdminAccessValue, verifyAdminAccessKey } from "@/lib/admin-auth";
import { publicUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ access: string }> };

export async function GET(request: Request, context: RouteParams) {
  const { access } = await context.params;
  if (!verifyAdminAccessKey(access)) return new NextResponse(null, { status: 404 });

  const response = NextResponse.redirect(publicUrl(request, "/admin"), 303);
  response.cookies.set(adminAccessCookieName, createAdminAccessValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}
