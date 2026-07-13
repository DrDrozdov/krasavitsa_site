"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { analyticsAllowed } from "@/components/cookie-consent";

function deviceType() {
  if (window.innerWidth < 768) return "mobile";
  if (window.innerWidth < 1100) return "tablet";
  return "desktop";
}

function browserGroup() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("Chrome/")) return "Chrome";
  return "Other";
}

function referrerGroup() {
  if (!document.referrer) return "direct";
  try {
    const host = new URL(document.referrer).hostname;
    if (host.includes("t.me") || host.includes("telegram")) return "telegram";
    if (/yandex|google|bing|mail\.ru/.test(host)) return "search";
    if (/vk\.com|tiktok|dzen/.test(host)) return "social";
    return host === location.hostname ? "direct" : "other";
  } catch {
    return "other";
  }
}

function send(eventName: string, elementKey = "") {
  if (!analyticsAllowed()) return;
  const params = new URLSearchParams(location.search);
  const payload = JSON.stringify({
    eventName,
    pagePath: location.pathname,
    pageGroup: location.pathname === "/" ? "home" : location.pathname.split("/")[1],
    elementKey,
    deviceType: deviceType(),
    browserGroup: browserGroup(),
    referrerGroup: referrerGroup(),
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
  });
  const queued = navigator.sendBeacon?.("/api/analytics/events", new Blob([payload], { type: "application/json" }));
  if (!queued) void fetch("/api/analytics/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true, cache: "no-store" });
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    send("page_view");
    const afterConsent = () => send("page_view");
    window.addEventListener("krasavitsa-cookie-consent", afterConsent);
    return () => window.removeEventListener("krasavitsa-cookie-consent", afterConsent);
  }, [pathname]);

  useEffect(() => {
    const reached = new Set<number>();
    const engagedTimer = window.setTimeout(() => send("engaged_visit", "15s"), 15000);
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = Math.round((window.scrollY / scrollable) * 100);
      for (const threshold of [50, 90]) {
        if (percent >= threshold && !reached.has(threshold)) {
          reached.add(threshold);
          send("scroll_depth", `${threshold}%`);
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(engagedTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    const click = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a,button") : null;
      if (!target) return;
      const href = target instanceof HTMLAnchorElement ? target.href : "";
      const key = target.getAttribute("data-analytics") ?? (href ? new URL(href, location.href).pathname : "button");
      if (href.includes("t.me/")) send("telegram_click", key);
      else if (target.closest("header,nav")) send("navigation_click", key);
      else send("cta_click", key);
    };
    document.addEventListener("click", click, { passive: true });
    return () => document.removeEventListener("click", click);
  }, []);

  useEffect(() => {
    // Only aggregate the occurrence and page of a client error. No message,
    // stack trace, query text, address or other personal data is transmitted.
    const report = () => send("form_error", "client_runtime");
    window.addEventListener("error", report);
    window.addEventListener("unhandledrejection", report);
    return () => {
      window.removeEventListener("error", report);
      window.removeEventListener("unhandledrejection", report);
    };
  }, []);

  return null;
}
