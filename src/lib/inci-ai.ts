import "server-only";

import sharp from "sharp";
import { INCI_IMAGE_LIMIT_BYTES, INCI_TEXT_LIMIT, type InciOcr } from "@/lib/inci-types";
import { sanitizeInciText } from "@/lib/inci-analyzer";

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type VisionProvider = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

type OcrResult = {
  inciText: string;
  ocr: InciOcr;
};

function providerConfig(): VisionProvider | null {
  const firstNonEmpty = (...values: Array<string | undefined>) =>
    values.map((value) => value?.trim()).find(Boolean);

  const dedicatedKey = firstNonEmpty(process.env.INCI_AI_API_KEY);
  const officialKey = firstNonEmpty(process.env.OPENAI_API_KEY);
  const tunnelKey = firstNonEmpty(process.env.AI_TUNNEL_API_KEY);
  const deepseekKey = firstNonEmpty(process.env.DEEPSEEK_API_KEY);
  const apiKey = firstNonEmpty(dedicatedKey, officialKey, tunnelKey, deepseekKey);
  if (!apiKey) return null;

  const model = firstNonEmpty(
    process.env.INCI_AI_VISION_MODEL,
    process.env.OPENAI_VISION_MODEL,
    process.env.AI_TUNNEL_VISION_MODEL,
    process.env.DEEPSEEK_VISION_MODEL,
  ) || "gpt-4o-mini";

  const configuredBase = firstNonEmpty(
    process.env.INCI_AI_BASE_URL,
    officialKey ? process.env.OPENAI_BASE_URL : undefined,
    tunnelKey ? process.env.AI_TUNNEL_BASE_URL : undefined,
    deepseekKey ? process.env.DEEPSEEK_BASE_URL : undefined,
  );
  const baseUrl = (configuredBase || (officialKey ? "https://api.openai.com/v1" : "")).replace(/\/+$/, "");
  if (!baseUrl || !/^https?:\/\//iu.test(baseUrl)) return null;
  return { apiKey, baseUrl, model };
}

export function isInciOcrConfigured() {
  return Boolean(providerConfig());
}

function hasBytes(buffer: Buffer, expected: number[], offset = 0) {
  return expected.every((byte, index) => buffer[offset + index] === byte);
}

function validImageSignature(buffer: Buffer, mime: string) {
  if (mime === "image/jpeg") return hasBytes(buffer, [0xff, 0xd8, 0xff]);
  if (mime === "image/png") return hasBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (mime === "image/webp") {
    return buffer.subarray(0, 4).toString("ascii") === "RIFF"
      && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }
  return false;
}

export async function prepareInciImage(file: File) {
  const mime = file.type.split(";")[0].trim().toLocaleLowerCase("en-US");
  if (!SUPPORTED_IMAGE_TYPES.has(mime)) throw new Error("IMAGE_TYPE");
  if (file.size < 1_000 || file.size > INCI_IMAGE_LIMIT_BYTES) throw new Error("IMAGE_SIZE");

  const raw = Buffer.from(await file.arrayBuffer());
  if (!validImageSignature(raw, mime)) throw new Error("IMAGE_SIGNATURE");

  try {
    const image = sharp(raw, {
      failOn: "warning",
      limitInputPixels: 24_000_000,
      sequentialRead: true,
    });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height || metadata.width < 320 || metadata.height < 320) {
      throw new Error("IMAGE_DIMENSIONS");
    }
    const normalized = await image
      .rotate()
      .resize({ width: 2_000, height: 2_000, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#f6f1f2" })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
    return `data:image/jpeg;base64,${normalized.toString("base64")}`;
  } catch (error) {
    if (error instanceof Error && error.message === "IMAGE_DIMENSIONS") throw error;
    throw new Error("IMAGE_DECODE");
  }
}

function responseText(content: unknown) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const value = part as { text?: unknown };
      return typeof value.text === "string" ? value.text : "";
    })
    .join("\n");
}

function parseOcrPayload(raw: string): OcrResult {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*|\s*```$/giu, "");
  let payload: { inciText?: unknown; quality?: unknown; note?: unknown } = {};
  try {
    payload = JSON.parse(cleaned) as typeof payload;
  } catch {
    payload = { inciText: cleaned, quality: "low", note: "Ответ распознавания не содержал структурированный JSON." };
  }
  const inciText = sanitizeInciText(typeof payload.inciText === "string" ? payload.inciText : "");
  const quality = payload.quality === "high" || payload.quality === "medium" ? payload.quality : "low";
  const note = typeof payload.note === "string"
    ? payload.note.replace(/\s+/g, " ").trim().slice(0, 220)
    : undefined;
  if (inciText.length < 10 || inciText.length > INCI_TEXT_LIMIT) throw new Error("OCR_UNREADABLE");
  return { inciText, ocr: { quality, note } };
}

export async function recognizeInciFromImage(imageDataUrl: string): Promise<OcrResult> {
  const provider = providerConfig();
  if (!provider) throw new Error("OCR_NOT_CONFIGURED");

  const messages = [
    {
      role: "system",
      content: [
        "Ты выполняешь точную OCR-транскрипцию косметической этикетки.",
        "Найди только список Ingredients или INCI и сохрани исходный порядок компонентов.",
        "Не исправляй и не дополняй названия по догадке.",
        "Если часть строки не читается, не выдумывай её и укажи это в note.",
        "Верни JSON: {\"inciText\":\"компоненты через запятую\",\"quality\":\"high|medium|low\",\"note\":\"короткая заметка\"}.",
      ].join(" "),
    },
    {
      role: "user",
      content: [
        { type: "text", text: "Перепиши INCI с этой этикетки. Не анализируй состав на этом этапе." },
        { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
      ],
    },
  ];

  const requestBody = {
    model: provider.model,
    temperature: 0,
    max_tokens: 2_000,
    response_format: { type: "json_object" },
    messages,
  };

  let lastStatus = 0;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const body = attempt === 0 ? requestBody : { ...requestBody, response_format: undefined };
    try {
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(45_000),
      });
      lastStatus = response.status;
      const data = await response.json().catch(() => ({})) as {
        choices?: Array<{ message?: { content?: unknown } }>;
      };
      if (!response.ok) {
        if (attempt === 0 && (response.status === 400 || response.status === 422)) continue;
        throw new Error(`OCR_HTTP_${response.status}`);
      }
      const raw = responseText(data.choices?.[0]?.message?.content);
      if (!raw) throw new Error("OCR_EMPTY");
      return parseOcrPayload(raw);
    } catch (error) {
      if (error instanceof Error && (error.message === "OCR_UNREADABLE" || error.message === "OCR_EMPTY")) throw error;
      if (attempt === 0 && (lastStatus === 400 || lastStatus === 422)) continue;
      throw new Error("OCR_UPSTREAM");
    }
  }
  throw new Error("OCR_UPSTREAM");
}
