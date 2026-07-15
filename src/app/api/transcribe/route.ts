import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maximumAudioBytes = 8 * 1024 * 1024;
const supportedTypes = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/x-m4a",
]);

function trustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim().toLowerCase();
    const directHost = request.headers.get("host")?.trim().toLowerCase();
    const publicHost = process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host.toLowerCase()
      : null;
    return [forwardedHost, directHost, publicHost].filter(Boolean).includes(originHost);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!trustedOrigin(request)) return NextResponse.json({ error: "Недопустимый источник запроса." }, { status: 403 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Голосовой ввод ещё не подключён на сервере. Добавьте OPENAI_API_KEY в основной сервис krasavitsa." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать аудиозапись." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size < 700 || file.size > maximumAudioBytes) {
    return NextResponse.json({ error: "Запишите фразу длиной до 20 секунд." }, { status: 400 });
  }
  const normalizedType = file.type.split(";")[0].toLowerCase();
  if (normalizedType && !supportedTypes.has(normalizedType)) {
    return NextResponse.json({ error: "Этот формат аудио не поддерживается." }, { status: 415 });
  }

  const upstreamBody = new FormData();
  upstreamBody.append("file", file, file.name || "voice-query.webm");
  upstreamBody.append("model", process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe");
  upstreamBody.append("language", "ru");
  upstreamBody.append("response_format", "json");
  upstreamBody.append("prompt", "Короткий запрос о косметике, уходе за кожей, волосами или парфюмерии. Сохраняй названия брендов, суммы и единицы измерения.");

  try {
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstreamBody,
      signal: AbortSignal.timeout(30_000),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({})) as { text?: string; error?: { message?: string } };
    if (!response.ok || typeof data.text !== "string") {
      return NextResponse.json({ error: "Сейчас не удалось распознать голос. Попробуйте ещё раз." }, { status: 502 });
    }
    const text = data.text.replace(/\s+/g, " ").trim().slice(0, 1600);
    if (!text) return NextResponse.json({ error: "Не удалось расслышать фразу." }, { status: 422 });
    return NextResponse.json({ text }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Сервис распознавания не ответил вовремя." }, { status: 504 });
  }
}
