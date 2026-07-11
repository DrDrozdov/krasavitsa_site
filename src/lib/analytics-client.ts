export function trackAnalyticsEvent(eventName: string, elementKey = "") {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    eventName,
    elementKey,
    pagePath: window.location.pathname,
    pageGroup: window.location.pathname === "/" ? "home" : window.location.pathname.split("/")[1],
    deviceType: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1100 ? "tablet" : "desktop",
  });
  void fetch("/api/analytics/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
}
