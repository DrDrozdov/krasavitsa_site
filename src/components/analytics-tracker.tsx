"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics-client";

type LayoutShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean };
type EventTimingEntry = PerformanceEntry & { duration: number; interactionId?: number };

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const enteredAt = performance.now();
    let maxDepth = 0;
    let sentLeave = false;
    trackAnalyticsEvent("page_view");

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) maxDepth = Math.max(maxDepth, Math.round((window.scrollY / scrollable) * 100));
    };
    const leave = () => {
      if (sentLeave) return;
      sentLeave = true;
      trackAnalyticsEvent("page_leave", `${Math.min(100, maxDepth)}%`, {
        durationMs: Math.round(performance.now() - enteredAt),
      });
    };

    const engagedTimer = window.setTimeout(() => trackAnalyticsEvent("engaged_visit", "15s"), 15000);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", leave);
    return () => {
      window.clearTimeout(engagedTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, [pathname]);

  useEffect(() => {
    const click = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a,button") : null;
      if (!target) return;
      const href = target instanceof HTMLAnchorElement ? target.href : "";
      const key = target.getAttribute("data-analytics") ?? (href ? new URL(href, location.href).pathname : "button");
      if (href.includes("t.me/")) trackAnalyticsEvent("telegram_click", key);
      else if (/vk\.|instagram\.com/.test(href)) trackAnalyticsEvent("social_click", href.includes("vk.") ? "vk" : "instagram");
      else if (target.closest("header,nav")) trackAnalyticsEvent("navigation_click", key);
      else trackAnalyticsEvent("cta_click", key);
    };
    document.addEventListener("click", click, { passive: true });
    return () => document.removeEventListener("click", click);
  }, []);

  useEffect(() => {
    const report = () => trackAnalyticsEvent("client_error", "runtime", { result: "error" });
    window.addEventListener("error", report);
    window.addEventListener("unhandledrejection", report);
    return () => {
      window.removeEventListener("error", report);
      window.removeEventListener("unhandledrejection", report);
    };
  }, []);

  useEffect(() => {
    let lcp = 0;
    let cls = 0;
    let inp = 0;
    const observers: PerformanceObserver[] = [];

    const observe = (type: string, callback: PerformanceObserverCallback) => {
      try {
        const observer = new PerformanceObserver(callback);
        observer.observe({ type, buffered: true });
        observers.push(observer);
      } catch {
        // Older Safari versions expose only a subset of PerformanceObserver entry types.
      }
    };

    observe("largest-contentful-paint", (list) => {
      const last = list.getEntries().at(-1);
      if (last) lcp = last.startTime;
    });
    observe("layout-shift", (list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) if (!entry.hadRecentInput) cls += entry.value;
    });
    observe("event", (list) => {
      for (const entry of list.getEntries() as EventTimingEntry[]) if (entry.interactionId && entry.duration > inp) inp = entry.duration;
    });

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navigation) trackAnalyticsEvent("web_vital", "TTFB", { metricName: "TTFB", metricValue: Math.round(navigation.responseStart) });

    let flushed = false;
    const flush = () => {
      if (flushed) return;
      flushed = true;
      if (lcp) trackAnalyticsEvent("web_vital", "LCP", { metricName: "LCP", metricValue: Math.round(lcp) });
      trackAnalyticsEvent("web_vital", "CLS", { metricName: "CLS", metricValue: Number(cls.toFixed(3)) });
      if (inp) trackAnalyticsEvent("web_vital", "INP", { metricName: "INP", metricValue: Math.round(inp) });
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      observers.forEach((observer) => observer.disconnect());
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return null;
}
