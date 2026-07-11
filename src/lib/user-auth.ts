import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "krasavitsa_user_session";
const maxAge = 60 * 60 * 24 * 30;

function secret() {
  return process.env.KRASAVITSA_USER_SESSION_SECRET ?? process.env.KRASAVITSA_ADMIN_SESSION_SECRET ?? "";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function authIsConfigured() {
  return secret().length >= 32;
}

export function createUserSessionValue(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + maxAge * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readUserSessionValue(value?: string) {
  if (!value || !authIsConfigured()) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId?: string; exp?: number };
    return parsed.userId && parsed.exp && parsed.exp > Date.now() ? parsed.userId : null;
  } catch {
    return null;
  }
}

export async function getCurrentUserId() {
  return readUserSessionValue((await cookies()).get(cookieName)?.value);
}

export function setUserSession(response: Response, value: string) {
  response.headers.append("Set-Cookie", `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}; Secure`);
}

export function clearUserSession(response: Response) {
  response.headers.append("Set-Cookie", `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Secure`);
}
