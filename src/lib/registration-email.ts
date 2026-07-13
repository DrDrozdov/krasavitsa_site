import "server-only";

export function registrationEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export async function sendRegistrationEmail(email: string, nickname: string, token: string) {
  if (!registrationEmailConfigured()) return false;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!siteUrl) return false;
  const verifyUrl = `${siteUrl}/api/profile/verify?token=${encodeURIComponent(token)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [email], subject: "Подтвердите почту — Красавица", text: `Здравствуйте, ${nickname}! Подтвердите почту в течение 24 часов: ${verifyUrl}`, html: `<p>Здравствуйте, ${nickname}!</p><p><a href="${verifyUrl}">Подтвердить почту</a> (ссылка действует 24 часа).</p>` }),
    cache: "no-store",
  });
  return response.ok;
}
