import { NextResponse } from "next/server";
import { analyzeInciText, sanitizeRoutineText } from "@/lib/inci-analyzer";
import { isInciOcrConfigured, prepareInciImage, recognizeInciFromImage } from "@/lib/inci-ai";
import { contentLengthExceeds, readLimitedJson, trustedInciMutationOrigin } from "@/lib/inci-security";
import {
  INCI_IMAGE_LIMIT_BYTES,
  INCI_ROUTINE_LIMIT,
  INCI_TEXT_LIMIT,
  type InciAnalysis,
} from "@/lib/inci-types";
import { getCurrentUserId } from "@/lib/user-auth";
import { getUserLibrary } from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const JSON_BODY_LIMIT = 16 * 1024;
const MULTIPART_BODY_LIMIT = INCI_IMAGE_LIMIT_BYTES + 96 * 1024;

function json(data: unknown, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

function errorMessage(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "INCI_TOO_SHORT") return { status: 422, error: "Добавьте хотя бы два ингредиента, разделённых запятыми." };
  if (code === "IMAGE_TYPE" || code === "IMAGE_SIGNATURE") return { status: 415, error: "Поддерживаются только настоящие JPG, PNG и WebP изображения." };
  if (code === "IMAGE_SIZE") return { status: 413, error: "Фото должно быть не больше 5 МБ и достаточно чётким для чтения." };
  if (code === "IMAGE_DIMENSIONS") return { status: 422, error: "Фото слишком маленькое. Нужна сторона не менее 320 пикселей." };
  if (code === "IMAGE_DECODE") return { status: 422, error: "Не удалось прочитать изображение. Попробуйте другое фото этикетки." };
  if (code === "OCR_NOT_CONFIGURED") return { status: 503, error: "Распознавание фото пока не подключено. Вставьте состав текстом." };
  if (code === "OCR_UNREADABLE" || code === "OCR_EMPTY") return { status: 422, error: "Не удалось уверенно прочитать список. Снимите этикетку ровно, при хорошем свете, или вставьте текст." };
  if (code === "OCR_UPSTREAM") return { status: 502, error: "Сервис распознавания не ответил. Фото не сохранено. Можно вставить состав текстом." };
  return { status: 400, error: "Не удалось обработать состав. Проверьте данные и попробуйте снова." };
}

export async function GET() {
  const userId = await getCurrentUserId();
  const library = userId ? await getUserLibrary(userId) : null;
  return json({
    authenticated: Boolean(userId && library),
    photoRecognitionAvailable: isInciOcrConfigured(),
    savedCount: library?.inciAnalyses?.length ?? 0,
  });
}

export async function POST(request: Request) {
  if (!trustedInciMutationOrigin(request)) {
    return json({ error: "Недопустимый источник запроса." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type")?.toLocaleLowerCase("en-US") ?? "";
  try {
    let analysis: InciAnalysis;

    if (contentType.startsWith("application/json")) {
      const body = await readLimitedJson<{ inciText?: unknown; routineText?: unknown }>(request, JSON_BODY_LIMIT);
      const inciText = typeof body.inciText === "string" ? body.inciText.trim() : "";
      const routineText = typeof body.routineText === "string" ? body.routineText : "";
      if (inciText.length > INCI_TEXT_LIMIT) return json({ error: `Сократите список ингредиентов до ${INCI_TEXT_LIMIT} символов.` }, { status: 413 });
      if (routineText.length > INCI_ROUTINE_LIMIT) return json({ error: `Сократите описание ухода до ${INCI_ROUTINE_LIMIT} символов.` }, { status: 413 });
      analysis = analyzeInciText(inciText, routineText, "text");
    } else if (contentType.startsWith("multipart/form-data")) {
      if (contentLengthExceeds(request, MULTIPART_BODY_LIMIT)) {
        return json({ error: "Фото должно быть не больше 5 МБ." }, { status: 413 });
      }
      const form = await request.formData();
      const file = form.get("image");
      const routineValue = form.get("routineText");
      const routineText = sanitizeRoutineText(typeof routineValue === "string" ? routineValue : "");
      if (!(file instanceof File)) return json({ error: "Добавьте фото этикетки." }, { status: 400 });
      const imageDataUrl = await prepareInciImage(file);
      const recognized = await recognizeInciFromImage(imageDataUrl);
      analysis = {
        ...analyzeInciText(recognized.inciText, routineText, "photo"),
        ocr: recognized.ocr,
      };
    } else {
      return json({ error: "Поддерживается текстовый JSON или фото в multipart/form-data." }, { status: 415 });
    }

    return json({ analysis });
  } catch (error) {
    const resolved = errorMessage(error);
    return json({ error: resolved.error }, { status: resolved.status });
  }
}
