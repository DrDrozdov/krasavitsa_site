import "server-only";

function normalizedOrigin(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin.toLocaleLowerCase("en-US");
  } catch {
    return null;
  }
}

export function trustedInciMutationOrigin(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site")?.toLocaleLowerCase("en-US");
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) return false;

  const origin = normalizedOrigin(request.headers.get("origin"));
  if (!origin) return false;

  const allowed = new Set<string>();
  const requestOrigin = normalizedOrigin(request.url);
  const configuredOrigin = normalizedOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (requestOrigin) allowed.add(requestOrigin);
  if (configuredOrigin) allowed.add(configuredOrigin);

  const directHost = request.headers.get("host")?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https" ? "https" : "http";
  for (const host of [directHost, forwardedHost]) {
    if (host && /^[a-z0-9.-]+(?::\d+)?$/iu.test(host)) allowed.add(`${forwardedProto}://${host}`.toLocaleLowerCase("en-US"));
  }

  return allowed.has(origin);
}

export function contentLengthExceeds(request: Request, maximumBytes: number) {
  const raw = request.headers.get("content-length");
  if (!raw) return false;
  const length = Number(raw);
  return !Number.isFinite(length) || length < 0 || length > maximumBytes;
}

export async function readLimitedJson<T>(request: Request, maximumBytes: number): Promise<T> {
  if (contentLengthExceeds(request, maximumBytes)) throw new Error("BODY_TOO_LARGE");
  if (!request.body) throw new Error("BODY_MISSING");

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maximumBytes) throw new Error("BODY_TOO_LARGE");
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(text) as T;
}
