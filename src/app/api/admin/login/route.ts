import { NextResponse } from "next/server";
import { adminConfiguration, adminCookieName, createAdminSessionValue, verifyAdminAccessKey, verifyAdminPassword } from "@/lib/admin-auth";
import { publicUrl } from "@/lib/public-url";

export async function POST(request: Request) {
  const configuration = adminConfiguration();
  if (!configuration.passwordConfigured || !configuration.sessionConfigured) {
    return NextResponse.redirect(publicUrl(request, "/admin?error=config"), 303);
  }
  const form = await request.formData();
  const access = String(form.get("access") ?? "");
  if (!verifyAdminAccessKey(access)) return NextResponse.redirect(publicUrl(request, "/"), 303);
  const password = String(form.get("password") ?? "");
  if (!verifyAdminPassword(password)) {
    return NextResponse.redirect(publicUrl(request, "/admin?error=1"), 303);
  }
  const response = NextResponse.redirect(publicUrl(request, `/admin?access=${encodeURIComponent(access)}`), 303);
  response.cookies.set(adminCookieName, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
