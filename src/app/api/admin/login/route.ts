import { NextResponse } from "next/server";
import { adminCookieName, createAdminSessionValue, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  if (!verifyAdminPassword(password)) {
    return NextResponse.redirect(new URL("/admin?error=1", request.url), 303);
  }
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(adminCookieName, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
