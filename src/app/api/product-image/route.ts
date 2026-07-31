import { lookup } from "node:dns/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { isSearchMode, type SearchMode } from "@/lib/beauty-engine";
import { packshotCacheControl } from "@/lib/recommendation-policy";

export const runtime = "nodejs";

const sourceHosts = [
  "goldapple.ru", "letu.ru", "rivegauche.ru", "wildberries.ru", "market.yandex.ru", "ozon.ru", "tsum.ru",
];

type Candidate = {
  url: URL;
  context: string;
  sourceType: "structured-product" | "product-meta" | "product-image" | "social-meta" | "image-search";
  width?: number;
  height?: number;
};

type ProductAsset = {
  bytes: Uint8Array;
  type: string;
  verified: boolean;
  synthetic?: boolean;
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

async function fetchPublicUrl(
  input: URL,
  init: RequestInit,
  allowHost?: (hostname: string) => boolean,
) {
  let current = new URL(input);
  for (let redirectCount = 0; redirectCount <= 4; redirectCount += 1) {
    if (allowHost && !allowHost(current.hostname)) throw new Error("UNTRUSTED_REDIRECT_HOST");
    await assertPublicUrl(current);
    const response = await fetch(current, { ...init, redirect: "manual" });
    if (response.status < 300 || response.status >= 400) return response;
    const location = response.headers.get("location");
    if (!location) return response;
    current = new URL(location, current);
  }
  throw new Error("TOO_MANY_REDIRECTS");
}

async function readLimitedText(response: Response, max = 300_000) {
  if (!response.body) return "";
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let output = "";
  while (output.length < max) { const { value, done } = await reader.read(); if (done) break; output += decoder.decode(value, { stream: true }); }
  await reader.cancel().catch(() => undefined);
  return output.slice(0, max);
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/\\u002F/gi, "/")
    .replace(/\\u0026/gi, "&")
    .replace(/\\\//g, "/");
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
  const response = await fetchPublicUrl(
    source,
    { headers: { "User-Agent": "Mozilla/5.0 KrasavitsaImageDiscovery/1.0", Accept: "text/html" }, cache: "no-store", signal: AbortSignal.timeout(5500) },
    hostAllowed,
  );
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
  // Several large marketplaces render the exact product packshot as a regular
  // server-side <img> instead of JSON-LD/OG metadata. Keep the surrounding alt
  // text as identity evidence; the verifier below still rejects banners,
  // unrelated assets and non-packshot aspect ratios.
  for (const tag of html.match(/<img\b[^>]+>/gi) ?? []) {
    const alt = extractAttribute(tag, "alt");
    const srcset = extractAttribute(tag, "srcset");
    const srcsetLargest = srcset
      .split(",")
      .map((item) => item.trim().split(/\s+/)[0])
      .filter(Boolean)
      .at(-1);
    const raw = srcsetLargest
      || extractAttribute(tag, "src")
      || extractAttribute(tag, "data-src")
      || extractAttribute(tag, "data-original");
    if (!raw || !/^https?:|^\//i.test(raw)) continue;
    if (/logo|icon|sprite|avatar|banner|promo|app-store|google-play|qr-code/i.test(`${alt} ${raw}`)) continue;
    try {
      candidates.push({
        url: new URL(raw, response.url),
        context: `${response.url} ${alt} ${tag.slice(0, 700)}`,
        sourceType: "product-image",
      });
    } catch { /* Invalid image URL. */ }
  }

  // Product pages increasingly keep their highest-resolution packshot in an
  // application-state JSON blob instead of a visible <img>. Extract only
  // image-shaped fields and retain nearby text as identity evidence for the
  // verifier. This covers Next/Nuxt storefronts without executing their JS.
  const embeddedImagePattern = /["'](?:image|imageUrl|image_url|original|originalUrl|large|largeUrl|zoom|zoomUrl|src)["']\s*:\s*["']([^"']+)["']/gi;
  for (const match of html.matchAll(embeddedImagePattern)) {
    const raw = decodeHtml(match[1]);
    if (!raw || !/(?:^https?:|^\/\/|^\/)/i.test(raw)) continue;
    if (!/\.(?:avif|webp|png|jpe?g)(?:[?#]|$)/i.test(raw) && !/(?:image|img|cdn|media|static)/i.test(raw)) continue;
    if (/logo|icon|sprite|avatar|banner|promo|campaign|app-store|google-play|qr-code/i.test(raw)) continue;
    try {
      const start = Math.max(0, (match.index ?? 0) - 420);
      const end = Math.min(html.length, (match.index ?? 0) + match[0].length + 420);
      candidates.push({
        url: new URL(raw, response.url),
        context: `${response.url} ${decodeHtml(html.slice(start, end))}`,
        sourceType: "product-image",
      });
    } catch { /* Invalid embedded image URL. */ }
  }
  const sourcePriority: Record<Candidate["sourceType"], number> = {
    "structured-product": 5,
    "product-image": 4,
    "product-meta": 3,
    "social-meta": 2,
    "image-search": 1,
  };
  return candidates
    .filter((item, index, all) => all.findIndex((candidate) => candidate.url.href === item.url.href) === index)
    .sort((left, right) => sourcePriority[right.sourceType] - sourcePriority[left.sourceType])
    .slice(0, 24);
}

async function imageSearchAgent(name: string): Promise<Candidate[]> {
  const endpoint = new URL("https://www.bing.com/images/search");
  endpoint.searchParams.set("q", `"${name}" product packshot white background official -advertisement -banner -campaign -review`);
  endpoint.searchParams.set("form", "HDRSC2");
  const response = await fetch(endpoint, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136 Safari/537.36", Accept: "text/html" },
    cache: "no-store",
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
  return candidates.filter((item, index, all) => all.findIndex((candidate) => candidate.url.href === item.url.href) === index).slice(0, 24);
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
      + (candidate.sourceType === "product-image" ? 7 : 0)
      + (/packshot|product|white background|transparent|official/i.test(candidate.context) ? 3 : 0)
      - (/advert|banner|campaign|editorial|review|lookbook|model|instagram|pinterest|youtube|hero|gift.?set/i.test(candidate.context) ? 14 : 0),
  })).sort((a, b) => b.score - a.score);

  const verify = async (candidate: (typeof ranked)[number]): Promise<ProductAsset | null> => {
    try {
      const declaredRatio = candidate.width && candidate.height ? candidate.width / candidate.height : 1;
      if (declaredRatio > 1.65 || declaredRatio < .5 || (candidate.width && candidate.width < 280) || (candidate.height && candidate.height < 280)) return null;
      const context = decodeURIComponent(`${candidate.url.pathname} ${candidate.context}`).toLowerCase();
      const tokenMatches = productTokens.filter((token) => context.includes(token)).length;
      const minimumMatches = candidate.sourceType === "product-image" || candidate.sourceType === "structured-product"
        ? 1
        : Math.max(1, Math.ceil(productTokens.length * .34));
      if (productTokens.length > 1 && tokenMatches < minimumMatches) return null;
      const response = await fetchPublicUrl(candidate.url, {
        headers: { "User-Agent": "Mozilla/5.0 KrasavitsaImageVerifier/1.0", Accept: "image/avif,image/webp,image/png,image/jpeg,*/*" },
        cache: "force-cache",
        signal: AbortSignal.timeout(6000),
      });
      const type = (response.headers.get("content-type") ?? "").split(";")[0];
      const length = Number(response.headers.get("content-length") ?? 0);
      if (!response.ok || !type.startsWith("image/") || type === "image/svg+xml" || length > 4_500_000) return null;
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength < 2_000 || bytes.byteLength > 4_500_000) return null;
      const metadata = await sharp(bytes, { limitInputPixels: 40_000_000 }).metadata();
      if (!metadata.width || !metadata.height || metadata.width < 280 || metadata.height < 280) return null;
      const ratio = metadata.width / metadata.height;
      if (ratio > 1.65 || ratio < .5) return null;
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
      const exactProductSource = candidate.sourceType === "structured-product"
        || candidate.sourceType === "product-image"
        || candidate.sourceType === "product-meta";
      const requiredCleanBorder = exactProductSource ? .34 : .56;
      if (!borderPixels || cleanBorder / borderPixels < requiredCleanBorder) return null;
      return { bytes, type, verified: true };
    } catch { return null; }
  };

  // Verify several high-confidence candidates at once. Retailers commonly
  // return a blocked CDN URL beside a valid alternate size; serial retries made
  // the browser give up before the good candidate was reached.
  const shortlist = ranked.slice(0, 18);
  for (let offset = 0; offset < shortlist.length; offset += 4) {
    const batch = await Promise.all(shortlist.slice(offset, offset + 4).map(verify));
    const match = batch.find((item): item is ProductAsset => Boolean(item));
    if (match) return match;
  }
  return null;
}

function escapeSvg(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character] ?? character);
}

function wrapProductName(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  for (const word of words) {
    const current = lines.at(-1) ?? "";
    if (!current || `${current} ${word}`.length > 25) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
    if (lines.length === 3) break;
  }
  return lines.map(escapeSvg);
}

async function fallbackImage(mode: SearchMode, name: string): Promise<ProductAsset> {
  const lines = wrapProductName(name);
  const silhouette = mode === "perfume"
    ? `<rect x="222" y="118" width="316" height="330" rx="76" fill="url(#body)" stroke="rgba(255,255,255,.8)" stroke-width="3"/><rect x="302" y="52" width="156" height="86" rx="22" fill="url(#cap)"/><rect x="348" y="22" width="64" height="48" rx="13" fill="#eadde2"/>`
    : mode === "hair"
      ? `<path d="M276 70h208l28 72v315c0 47-38 85-85 85H333c-47 0-85-38-85-85V142z" fill="url(#body)" stroke="rgba(255,255,255,.8)" stroke-width="3"/><rect x="290" y="34" width="172" height="62" rx="20" fill="url(#cap)"/>`
      : `<rect x="262" y="116" width="236" height="330" rx="58" fill="url(#body)" stroke="rgba(255,255,255,.8)" stroke-width="3"/><rect x="304" y="54" width="152" height="84" rx="22" fill="url(#cap)"/><rect x="354" y="20" width="52" height="52" rx="12" fill="#eadde2"/>`;
  const labels = lines.map((line, index) => `<tspan x="380" dy="${index ? 31 : 0}">${line}</tspan>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="580" viewBox="0 0 760 580">
    <defs>
      <linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".94"/><stop offset=".46" stop-color="#f1b3ca" stop-opacity=".64"/><stop offset="1" stop-color="#7d214b" stop-opacity=".3"/></linearGradient>
      <linearGradient id="cap" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#7a5264"/></linearGradient>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="24" stdDeviation="22" flood-color="#5c1736" flood-opacity=".2"/></filter>
    </defs>
    <g filter="url(#shadow)">${silhouette}</g>
    <rect x="306" y="238" width="148" height="1" fill="#6c2443" opacity=".28"/>
    <text x="380" y="474" text-anchor="middle" fill="#5e1d3c" font-family="Arial, sans-serif" font-size="23" font-weight="700">${labels}</text>
    <text x="380" y="556" text-anchor="middle" fill="#8b6475" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.7">ИЛЛЮСТРАЦИЯ · ФОТО ИСТОЧНИКА НЕДОСТУПНО</text>
  </svg>`;
  return { bytes: new Uint8Array(await sharp(Buffer.from(svg)).png().toBuffer()), type: "image/png", verified: false, synthetic: true };
}

async function composition(asset: ProductAsset) {
  const publicRoot = path.join(process.cwd(), "public");
  const [stage, logo] = await Promise.all([
    readFile(path.join(publicRoot, "recommendations", "krasavitsa-product-stage-v1.png")),
    readFile(path.join(publicRoot, "krasavitsa-lotus-logo.png")),
  ]);
  const base = await sharp(stage).resize(1200, 760, { fit: "cover", position: "centre" }).png().toBuffer();
  const product = await sharp(asset.bytes, { limitInputPixels: 40_000_000 })
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize(760, 580, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
  const brand = await sharp(logo).resize(72, 72, { fit: "cover" }).png().toBuffer();
  return sharp(base)
    .composite([
      { input: product, left: 220, top: 80, blend: "over" },
      { input: brand, left: 1090, top: 36, blend: "over" },
    ])
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get("name") ?? "Beauty product").trim().slice(0, 180);
  const mode = isSearchMode(searchParams.get("mode")) ? searchParams.get("mode") as SearchMode : "skin";
  let asset: ProductAsset | null = null;
  const sourceValues = [...new Set(searchParams.getAll("source"))].slice(0, 3);
  if (sourceValues.length) {
    try {
      const discovered = await Promise.allSettled(
        sourceValues.map((sourceValue) => imageDiscoveryAgent(new URL(sourceValue))),
      );
      const candidates = discovered.flatMap((result) => result.status === "fulfilled" ? result.value : []);
      asset = await imageVerificationAgent(name, candidates);
    } catch { /* The local fallback guarantees a visual. */ }
  }
  if (!asset) {
    try { asset = await imageVerificationAgent(name, await imageSearchAgent(name)); } catch { /* Search is a best-effort discovery stage. */ }
  }
  asset ??= await fallbackImage(mode, name);
  return new NextResponse(new Uint8Array(await composition(asset)), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": packshotCacheControl(asset.verified),
      "X-Content-Type-Options": "nosniff",
      "X-Krasavitsa-Packshot": asset.verified ? "verified" : asset.synthetic ? "illustrated-fallback" : "fallback",
    },
  });
}
