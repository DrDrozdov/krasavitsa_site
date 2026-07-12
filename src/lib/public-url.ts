import "server-only";

function validOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : null;
  } catch {
    return null;
  }
}

export function publicUrl(request: Request, pathname: string) {
  const configured = validOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return new URL(pathname, configured);

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto === "https" ? "https" : "http";
  if (host && /^[a-z0-9.-]+(?::\d+)?$/i.test(host)) return new URL(pathname, `${protocol}://${host}`);

  return new URL(pathname, request.url);
}
