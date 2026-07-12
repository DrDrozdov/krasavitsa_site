import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookieName = "krasavitsa_admin";

function sessionSecret() {
  return process.env.KRASAVITSA_ADMIN_SESSION_SECRET ?? "";
}

export function adminConfiguration() {
  const password = process.env.KRASAVITSA_ADMIN_PASSWORD ?? "";
  const secret = sessionSecret();
  return {
    passwordConfigured: password.length >= 12,
    sessionConfigured: secret.length >= 32,
  };
}

function expectedCookie() {
  return createHmac("sha256", sessionSecret()).update("krasavitsa-owner-v1").digest("hex");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyAdminPassword(password: string) {
  const configured = process.env.KRASAVITSA_ADMIN_PASSWORD ?? "";
  return adminConfiguration().passwordConfigured && safeEqual(password, configured);
}

export async function isAdminSession() {
  if (!adminConfiguration().sessionConfigured) return false;
  const value = (await cookies()).get(adminCookieName)?.value ?? "";
  return safeEqual(value, expectedCookie());
}

export function createAdminSessionValue() {
  return expectedCookie();
}
