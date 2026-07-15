export type AnalyticsDetails = {
  result?: "success" | "cancel" | "error" | "timeout";
  mode?: "skin" | "hair" | "perfume" | string;
  source?: string;
  durationMs?: number;
  productCount?: number;
  metricName?: "LCP" | "CLS" | "INP" | "TTFB" | string;
  metricValue?: number;
};

function deviceType() {
  if (window.innerWidth < 768) return "mobile";
  if (window.innerWidth < 1100) return "tablet";
  return "desktop";
}

function browserGroup() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/") && !ua.includes("Chrome/") && !ua.includes("CriOS/")) return "Safari";
  if (ua.includes("Chrome/") || ua.includes("CriOS/")) return "Chrome";
  return "Other";
}

function referrerGroup() {
  if (!document.referrer) return "direct";
  try {
    const host = new URL(document.referrer).hostname;
    if (host.includes("t.me") || host.includes("telegram")) return "telegram";
    if (/yandex|google|bing|mail\.ru/.test(host)) return "search";
    if (/vk\.|tiktok|dzen|instagram/.test(host)) return "social";
    return host === location.hostname ? "direct" : "other";
  } catch {
    return "other";
  }
}

function basePayload(eventName: string, elementKey: string, details: AnalyticsDetails) {
  const params = new URLSearchParams(location.search);
  const root = document.documentElement;
  return {
    eventName,
    elementKey,
    pagePath: location.pathname,
    pageGroup: location.pathname === "/" ? "home" : location.pathname.split("/")[1],
    deviceType: deviceType(),
    browserGroup: browserGroup(),
    referrerGroup: referrerGroup(),
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    theme: root.dataset.theme ?? "unknown",
    themeSource: root.dataset.themeSource ?? "unknown",
    viewport: `${Math.round(window.innerWidth / 100) * 100}x${Math.round(window.innerHeight / 100) * 100}`,
    language: navigator.language?.slice(0, 8) ?? "",
    ...details,
  };
}

export function trackAnalyticsEvent(eventName: string, elementKey = "", details: AnalyticsDetails = {}) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(basePayload(eventName, elementKey, details));
  const queued = navigator.sendBeacon?.(
    "/api/analytics/events",
    new Blob([payload], { type: "application/json" }),
  );
  if (!queued) {
    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      cache: "no-store",
    });
  }
}
