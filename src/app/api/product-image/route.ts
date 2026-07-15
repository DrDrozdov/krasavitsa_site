import { lookup } from "node:dns/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { isSearchMode, type SearchMode } from "@/lib/beauty-engine";

export const runtime = "nodejs";

const sourceHosts = [
  "purito.com", "cosrx.com", "beautyofjoseon.com", "lador.co.kr", "olaplex.com", "chi.com",
  "maisonmargiela.com", "maisonmargiela-fragrances.us", "jomalone.com", "diptyqueparis.com",
  "goldapple.ru", "letu.ru", "rivegauche.ru", "ozon.ru", "wildberries.ru", "market.yandex.ru",
];

const fallback: Record<SearchMode, string> = {
  skin: "skin-packshot-v2.webp",
  hair: "hair-packshot-v2.webp",
  perfume: "perfume-packshot-v2.webp",
};

type Candidate = {
  url: URL;
  context: string;
  sourceType: "structured-product" | "product-meta" | "social-meta" | "image-search";
  width?: number;
  height?: number;
};

function hostAllowed(hostname: string) {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return sourceHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

function isPrivateAddress(address: string) {
  const value = address.toLowerCase();
  if (value === "::1" || value.startsWith("fe80:") || value.startsWith("fc") || value.startsWith("fd")) return true;
  const parts = value.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return false;
  return parts[0] === 10 || parts[0] === 127 || (parts[0] === 169 && parts[1] === 254) || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || parts[0] === 0;
}

async function assertPublicUrl(url: URL) {
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error("UNSAFE_PROTOCOL");
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("UNSAFE_HOST");
}

async function readLimitedText(response: Response, max = 300_000) {
  if (!response.body) return "";
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let output = "";
  while (output.length < max) { const { value, done } = await reader.read(); if (done) break; output += decoder.decode(value, { stream: true }); }
  await reader.cancel().catch(() => undefined);
  return output.slice(0, max);
}

function decodeHtml(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x2F;/gi, "/");
}

function extractAttribute(tag: string, name: string) {
  return decodeHtml(tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1] ?? "");
}

function structuredProductImages(value: unknown, context = ""): Array<{ url: string; context: string }> {
  if (Array.isArray(value)) return value.flatMap((item) => structuredProductImages(item, context));
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const type = Array.isArray(record["@type"]) ? record["@type"] : [record["@type"]];
  const isProduct = type.some((item) => typeof item === "string" && item.toLowerCase() === "product");
  const nextContext = [context, record.name, record.brand && typeof record.brand === "object" ? (record.brand as Record<string, unknown>).name : record.brand]
    .filter((item): item is string => typeof item === "string").join(" ");
  const direct = isProduct
    ? [record.image].flat().flatMap((item) => typeof item === "string" ? [{ url: item, context: nextContext }] : structuredProductImages(item, nextContext))
    : [];
  return [...direct, ...Object.values(record).flatMap((item) => structuredProductImages(item, nextContext))];
}

async function imageDiscoveryAgent(source: URL): Promise<Candidate[]> {
  if (!hostAllowed(source.hostname)) return [];
  await assertPublicUrl(source);
  const response = await fetch(source, { headers: { "User-Agent": "Mozilla/5.0 KrasavitsaImageDiscovery/1.0", Accept: "text/html" }, redirect: "follow", cache: "force-cache", signal: AbortSignal.timeout(5500) });
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return [];
  const html = await readLimitedText(response);
  const candidates: Candidate[] = [];
  for (const script of html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) ?? []) {
    const body = script.replace(/^<script\b[^>]*>/i, "").replace(/<\/script>$/i, "").trim();
    try {
      for (const item of structuredProductImages(JSON.parse(body))) {
        try { candidates.push({ url: new URL(item.url, response.url), context: `${response.url} ${item.context}`, sourceType: "structured-product" }); } catch { /* Invalid structured image URL. */ }
      }
    } catch { /* Ignore malformed structured metadata. */ }
  }
  const tags = html.match(/<(?:meta|link)\b[^>]+>/gi) ?? [];
  for (const tag of tags) {
    if (!/(?:og:image|twitter:image|image_src|product:image)/i.test(tag)) continue;
    const raw = extractAttribute(tag, "content") || extractAttribute(tag, "href");
    if (!raw) continue;
    try {
      candidates.push({
        url: new URL(raw, response.url),
        context: `${response.url} ${tag.slice(0, 500)}`,
        sourceType: /product:image/i.test(tag) ? "product-meta" : "social-meta",
      });
    } catch { /* Invalid metadata URL. */ }
  }
  return candidates.filter((item, index, all) => all.findIndex((candidate) => candidate.url.href === item.url.href) === index).slice(0, 8);
}

async function imageSearchAgent(name: string): Promise<Candidate[]> {
  const endpoint = new URL("https://www.bing.com/images/search");
  endpoint.searchParams.set("q", `"${name}" product packshot white background official -advertisement -banner -campaign -review`);
  endpoint.searchParams.set("form", "HDRSC2");
  const response = await fetch(endpoint, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36", Accept: "text/html" },
    cache: "force-cache",
    signal: AbortSignal.timeout(5500),
  });
  if (!response.ok) return [];
  const html = await readLimitedText(response, 500_000);
  const candidates: Candidate[] = [];
  for (const tag of html.match(/<a\b[^>]*class=["'][^"']*iusc[^"']*["'][^>]*>/gi) ?? []) {
    const metadata = decodeHtml(extractAttribute(tag, "m"));
    if (!metadata) continue;
    try {
      const parsed = JSON.parse(metadata) as { murl?: string; purl?: string; t?: string; w?: number; h?: number };
      if (!parsed.murl) continue;
      candidates.push({ url: new URL(parsed.murl), context: `${parsed.t ?? ""} ${parsed.purl ?? ""} ${parsed.murl}`, sourceType: "image-search", width: parsed.w, height: parsed.h });
    } catch { /* Ignore malformed search metadata. */ }
  }
  return candidates.filter((item, index, all) => all.findIndex((candidate) => candidate.url.href === item.url.href) === index).slice(0, 12);
}

function tokens(value: string) {
  return value.toLowerCase().replace(/[^a-zа-яё0-9]+/g, " ").split(/\s+/).filter((token) => token.length > 2 && !["the", "and", "with", "eau", "cream", "gel", "для"].includes(token)).slice(0, 10);
}

async function imageVerificationAgent(name: string, candidates: Candidate[]) {
  const productTokens = tokens(name);
  const ranked = candidates.map((candidate) => ({
    ...candidate,
    score: productTokens.filter((token) => decodeURIComponent(`${candidate.url.pathname} ${candidate.context}`).toLowerCase().includes(token)).length * 5
      + (candidate.sourceType === "structured-product" ? 8 : candidate.sourceType === "product-meta" ? 5 : 0)
      + (/packshot|product|white background|transparent|official/i.test(candidate.context) ? 3 : 0)
      - (/advert|banner|campaign|editorial|review|lookbook|model|instagram|pinterest|youtube|hero|gift.?set/i.test(candidate.context) ? 14 : 0),
  })).sort((a, b) => b.score - a.score);

  for (const candidate of ranked.slice(0, 9)) {
    try {
      const declaredRatio = candidate.width && candidate.height ? candidate.width / candidate.height : 1;
      if (declaredRatio > 1.65 || declaredRatio < .5 || (candidate.width && candidate.width < 280) || (candidate.height && candidate.height < 280)) continue;
      const context = decodeURIComponent(`${candidate.url.pathname} ${candidate.context}`).toLowerCase();
      const tokenMatches = productTokens.filter((token) => context.includes(token)).length;
      if (productTokens.length > 1 && tokenMatches < Math.max(1, Math.ceil(productTokens.length * .34))) continue;
      await assertPublicUrl(candidate.url);
      const response = await fetch(candidate.url, { headers: { "User-Agent": "Mozilla/5.0 KrasavitsaImageVerifier/1.0", Accept: "image/avif,image/webp,image/png,image/jpeg,*/*" }, redirect: "follow", cache: "force-cache", signal: AbortSignal.timeout(6000) });
      const type = (response.headers.get("content-type") ?? "").split(";")[0];
      const length = Number(response.headers.get("content-length") ?? 0);
      if (!response.ok || !type.startsWith("image/") || type === "image/svg+xml" || length > 4_500_000) continue;
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength < 2_000 || bytes.byteLength > 4_500_000) continue;
      const metadata = await sharp(bytes, { limitInputPixels: 40_000_000 }).metadata();
      if (!metadata.width || !metadata.height || metadata.width < 280 || metadata.height < 280) continue;
      const ratio = metadata.width / metadata.height;
      if (ratio > 1.65 || ratio < .5) continue;
      const { data, info } = await sharp(bytes, { limitInputPixels: 40_000_000 })
        .rotate()
        .ensureAlpha()
        .resize(48, 48, { fit: "fill" })
        .raw()
        .toBuffer({ resolveWithObject: true });
      let cleanBorder = 0;
      let borderPixels = 0;
      for (let y = 0; y < info.height; y += 1) {
        for (let x = 0; x < info.width; x += 1) {
          if (x > 2 && x < info.width - 3 && y > 2 && y < info.height - 3) continue;
          const offset = (y * info.width + x) * info.channels;
          const [r, g, b, alpha = 255] = [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
          const neutralWhite = r > 226 && g > 226 && b > 226 && Math.max(r, g, b) - Math.min(r, g, b) < 25;
          if (alpha < 45 || neutralWhite) cleanBorder += 1;
          borderPixels += 1;
        }
      }
      if (!borderPixels || cleanBorder / borderPixels < .58) continue;
      return { bytes, type, verified: true };
    } catch { /* Try the next candidate. */ }
  }
  return null;
}

async function fallbackImage(mode: SearchMode) {
  return { bytes: new Uint8Array(await readFile(path.join(process.cwd(), "public", "recommendations", fallback[mode]))), type: "image/webp", verified: false };
}

function xml(value: string) { return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char] ?? char)); }

function composition(name: string, asset: { bytes: Uint8Array; type: string; verified: boolean }) {
  const data = Buffer.from(asset.bytes).toString("base64");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" role="img" aria-labelledby="title description">
  <title id="title">${xml(name)}</title><desc id="description">${asset.verified ? "Проверенный packshot товара на белом фоне" : "Резервный визуал категории"}</desc>
  <rect width="1200" height="760" rx="24" fill="#fff"/>
  <image href="data:${asset.type};base64,${data}" x="80" y="42" width="1040" height="648" preserveAspectRatio="xMidYMid meet"/>
  ${asset.verified ? "" : '<rect x="30" y="694" width="1140" height="38" rx="19" fill="#f7edf1"/><text x="600" y="720" text-anchor="middle" fill="#6c2943" font-family="Arial,sans-serif" font-size="16" font-weight="700">ТОЧНЫЙ PACKSHOT ПРОВЕРЯЕТСЯ</text>'}
  </svg>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get("name") ?? "Beauty product").trim().slice(0, 180);
  const mode = isSearchMode(searchParams.get("mode")) ? searchParams.get("mode") as SearchMode : "skin";
  let asset: Awaited<ReturnType<typeof fallbackImage>> | null = null;
  const sourceValue = searchParams.get("source");
  if (sourceValue) {
    try {
      const source = new URL(sourceValue);
      asset = await imageVerificationAgent(name, await imageDiscoveryAgent(source));
    } catch { /* The local fallback guarantees a visual. */ }
  }
  if (!asset) {
    try { asset = await imageVerificationAgent(name, await imageSearchAgent(name)); } catch { /* Search is a best-effort discovery stage. */ }
  }
  asset ??= await fallbackImage(mode);
  return new NextResponse(composition(name, asset), {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000", "X-Content-Type-Options": "nosniff", "X-Krasavitsa-Packshot": asset.verified ? "verified" : "fallback" },
  });
}
