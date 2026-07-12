import { NextResponse } from "next/server";
import { adminCookieName } from "@/lib/admin-auth";
import { publicUrl } from "@/lib/public-url";

export async function POST(request: Request) {
  const response = NextResponse.redirect(publicUrl(request, "/admin"), 303);
  response.cookies.set(adminCookieName, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
