import { lookup } from "node:dns/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
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

const palettes = [
  ["#f6d7df", "#72253d", "#2b101b", "#ad4969"], ["#f1c6d5", "#8b244a", "#240e17", "#bd5678"],
  ["#efd8e7", "#6d315e", "#20101f", "#9e5a8b"], ["#f7d4ca", "#8d3b4b", "#291014", "#c16872"],
  ["#e9d6ef", "#563663", "#180f1e", "#865697"], ["#f9ddd7", "#8a2f3e", "#2a1015", "#c65a68"],
  ["#eed1db", "#6c2943", "#221019", "#a44b69"], ["#f5cfd3", "#933044", "#2b0e15", "#d25c70"],
  ["#e8d8e4", "#633852", "#1c1118", "#946078"], ["#f2d4c8", "#78413f", "#25120f", "#b66d62"],
  ["#f0d2ec", "#723969", "#210f20", "#aa5a9b"], ["#f8d8e0", "#81364e", "#270f18", "#b95775"],
  ["#ead8d2", "#67403a", "#1c1310", "#9b6a60"], ["#f2cbdc", "#7d284f", "#260d19", "#bd4e79"],
  ["#e5d9ee", "#503b66", "#17121e", "#7d6696"], ["#f6d0c9", "#913f3d", "#2b1211", "#d16b66"],
  ["#ecd5df", "#713145", "#220f16", "#a9556b"], ["#f4d9e9", "#6f3b63", "#21121f", "#a66c99"],
  ["#efcfd0", "#802f38", "#260e12", "#bb525e"], ["#f8ded4", "#8b4637", "#2a1510", "#ca745f"],
] as const;

type Candidate = { url: URL; context: string };

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

async function imageDiscoveryAgent(source: URL): Promise<Candidate[]> {
  if (!hostAllowed(source.hostname)) return [];
  await assertPublicUrl(source);
  const response = await fetch(source, { headers: { "User-Agent": "Mozilla/5.0 KrasavitsaImageDiscovery/1.0", Accept: "text/html" }, redirect: "follow", cache: "force-cache", signal: AbortSignal.timeout(5500) });
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return [];
  const html = await readLimitedText(response);
  const tags = html.match(/<(?:meta|link)\b[^>]+>/gi) ?? [];
  const candidates: Candidate[] = [];
  for (const tag of tags) {
    if (!/(?:og:image|twitter:image|image_src|product:image)/i.test(tag)) continue;
    const raw = extractAttribute(tag, "content") || extractAttribute(tag, "href");
    if (!raw) continue;
    try { candidates.push({ url: new URL(raw, response.url), context: `${response.url} ${tag.slice(0, 500)}` }); } catch { /* Invalid metadata URL. */ }
  }
  return candidates.filter((item, index, all) => all.findIndex((candidate) => candidate.url.href === item.url.href) === index).slice(0, 8);
}

async function imageSearchAgent(name: string): Promise<Candidate[]> {
  const endpoint = new URL("https://www.bing.com/images/search");
  endpoint.searchParams.set("q", `${name} product packshot official`);
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
      const parsed = JSON.parse(metadata) as { murl?: string; purl?: string; t?: string };
      if (!parsed.murl) continue;
      candidates.push({ url: new URL(parsed.murl), context: `${parsed.t ?? ""} ${parsed.purl ?? ""} ${parsed.murl}` });
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
    score: productTokens.filter((token) => decodeURIComponent(`${candidate.url.pathname} ${candidate.context}`).toLowerCase().includes(token)).length,
  })).sort((a, b) => b.score - a.score);

  for (const candidate of ranked.slice(0, 5)) {
    try {
      await assertPublicUrl(candidate.url);
      const response = await fetch(candidate.url, { headers: { "User-Agent": "Mozilla/5.0 KrasavitsaImageVerifier/1.0", Accept: "image/avif,image/webp,image/png,image/jpeg,*/*" }, redirect: "follow", cache: "force-cache", signal: AbortSignal.timeout(6000) });
      const type = (response.headers.get("content-type") ?? "").split(";")[0];
      const length = Number(response.headers.get("content-length") ?? 0);
      if (!response.ok || !type.startsWith("image/") || type === "image/svg+xml" || length > 4_500_000) continue;
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength < 2_000 || bytes.byteLength > 4_500_000) continue;
      return { bytes, type, verified: true };
    } catch { /* Try the next candidate. */ }
  }
  return null;
}

async function fallbackImage(mode: SearchMode) {
  return { bytes: new Uint8Array(await readFile(path.join(process.cwd(), "public", "recommendations", fallback[mode]))), type: "image/webp", verified: false };
}

function hash(value: string) { let result = 0; for (const char of value) result = (result * 31 + char.charCodeAt(0)) >>> 0; return result; }
function xml(value: string) { return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char] ?? char)); }

function composition(name: string, asset: { bytes: Uint8Array; type: string; verified: boolean }, paletteIndex: number) {
  const [lightA, lightB, darkA, darkB] = palettes[paletteIndex];
  const data = Buffer.from(asset.bytes).toString("base64");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" role="img" aria-labelledby="title description">
  <title id="title">${xml(name)}</title><desc id="description">${asset.verified ? "Проверенное изображение товара" : "Резервный визуал категории"} на фирменном фоне Красавицы</desc>
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop class="a"/><stop offset="1" class="b"/></linearGradient><radialGradient id="glow"><stop stop-color="#fff" stop-opacity=".76"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><clipPath id="frame"><rect x="330" y="64" width="804" height="632" rx="70"/></clipPath><filter id="shadow"><feDropShadow dx="0" dy="28" stdDeviation="36" flood-opacity=".22"/></filter></defs>
  <style>.a{stop-color:${lightA}}.b{stop-color:${lightB}}.label{fill:#4b1828}@media(prefers-color-scheme:dark){.a{stop-color:${darkA}}.b{stop-color:${darkB}}.label{fill:#ffeef3}}</style>
  <rect width="1200" height="760" rx="72" fill="url(#bg)"/><circle cx="170" cy="120" r="330" fill="url(#glow)" opacity=".45"/><circle cx="1015" cy="670" r="240" fill="none" stroke="#fff" stroke-opacity=".24" stroke-width="2"/><circle cx="1015" cy="670" r="160" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
  <text class="label" x="74" y="92" font-family="Arial,sans-serif" font-size="21" font-weight="700" letter-spacing="5">KRASAVITSA · ${String(paletteIndex + 1).padStart(2, "0")}</text>
  <g filter="url(#shadow)" clip-path="url(#frame)"><rect x="330" y="64" width="804" height="632" rx="70" fill="#fff" fill-opacity=".82"/><image href="data:${asset.type};base64,${data}" x="350" y="84" width="764" height="592" preserveAspectRatio="xMidYMid meet"/></g>
  <path d="M73 658 C180 510 224 308 409 157" fill="none" stroke="#fff" stroke-opacity=".42" stroke-width="3"/><circle cx="73" cy="658" r="13" fill="#fff" fill-opacity=".74"/>
  </svg>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = (searchParams.get("name") ?? "Beauty product").trim().slice(0, 180);
  const mode = isSearchMode(searchParams.get("mode")) ? searchParams.get("mode") as SearchMode : "skin";
  const paletteIndex = hash(`${name}:${searchParams.get("variant") ?? "0"}`) % palettes.length;
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
  return new NextResponse(composition(name, asset, paletteIndex), {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000", "X-Content-Type-Options": "nosniff" },
  });
}
