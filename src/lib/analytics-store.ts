import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type AnalyticsEvent = {
  eventName: string;
  pagePath?: string;
  pageGroup?: string;
  elementKey?: string;
  deviceType?: "desktop" | "tablet" | "mobile";
  browserGroup?: "Chrome" | "Safari" | "Firefox" | "Edge" | "Other";
  referrerGroup?: "direct" | "search" | "social" | "telegram" | "ads" | "partner" | "other";
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  result?: "success" | "cancel" | "error" | "timeout";
  theme?: string;
  themeSource?: string;
  viewport?: string;
  language?: string;
  mode?: string;
  source?: string;
  durationMs?: number;
  productCount?: number;
  metricName?: string;
  metricValue?: number;
};

export type MetricAggregate = {
  sum: number;
  count: number;
  min: number;
  max: number;
};

export type DailyAnalytics = {
  date: string;
  total: number;
  events: Record<string, number>;
  pages: Record<string, number>;
  pageGroups: Record<string, number>;
  elements: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  referrers: Record<string, number>;
  campaigns: Record<string, number>;
  themes: Record<string, number>;
  themeSources: Record<string, number>;
  modes: Record<string, number>;
  sources: Record<string, number>;
  hours: Record<string, number>;
  viewports: Record<string, number>;
  languages: Record<string, number>;
  metrics: Record<string, MetricAggregate>;
  productsShown: number;
  errors: number;
};

type AnalyticsState = {
  updatedAt: string;
  daily: DailyAnalytics[];
};

const allowedEvents = new Set([
  "page_view", "page_leave", "engaged_visit", "scroll_depth", "cta_click", "telegram_click", "social_click", "navigation_click",
  "search_submit", "search_success", "search_rejected", "search_image", "article_create_start", "article_draft_save", "article_save",
  "article_like", "article_delete", "profile_register", "profile_login", "favorite_save", "history_save", "copy_product_name",
  "form_error", "client_error", "web_vital", "bot_action", "bot_error",
]);

const storePath = process.env.ANALYTICS_DATA_DIR
  ? path.join(process.env.ANALYTICS_DATA_DIR, "analytics.json")
  : path.join(process.cwd(), ".data", "analytics.json");

let writeQueue = Promise.resolve();

function analyticsParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.ANALYTICS_TIME_ZONE ?? "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function clean(value: unknown, max = 80) {
  return typeof value === "string" ? value.replace(/[^\p{L}\p{N}_./ %:-]/gu, "").slice(0, max) : "";
}

function finite(value: unknown, min = 0, max = 10_000_000) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : 0;
}

function increment(record: Record<string, number>, key: string, amount = 1) {
  if (key) record[key] = (record[key] ?? 0) + amount;
}

function recordMetric(record: Record<string, MetricAggregate>, key: string, rawValue: unknown) {
  const value = finite(rawValue);
  if (!key || !Number.isFinite(Number(rawValue))) return;
  const current = record[key];
  record[key] = current
    ? { sum: current.sum + value, count: current.count + 1, min: Math.min(current.min, value), max: Math.max(current.max, value) }
    : { sum: value, count: 1, min: value, max: value };
}

function emptyDay(date: string): DailyAnalytics {
  return {
    date, total: 0, events: {}, pages: {}, pageGroups: {}, elements: {}, devices: {}, browsers: {}, referrers: {}, campaigns: {},
    themes: {}, themeSources: {}, modes: {}, sources: {}, hours: {}, viewports: {}, languages: {}, metrics: {}, productsShown: 0, errors: 0,
  };
}

function ensureDay(day: Partial<DailyAnalytics> & { date: string }): DailyAnalytics {
  return {
    ...emptyDay(day.date),
    ...day,
    events: day.events ?? {}, pages: day.pages ?? {}, pageGroups: day.pageGroups ?? {}, elements: day.elements ?? {},
    devices: day.devices ?? {}, browsers: day.browsers ?? {}, referrers: day.referrers ?? {}, campaigns: day.campaigns ?? {},
    themes: day.themes ?? {}, themeSources: day.themeSources ?? {}, modes: day.modes ?? {}, sources: day.sources ?? {},
    hours: day.hours ?? {}, viewports: day.viewports ?? {}, languages: day.languages ?? {}, metrics: day.metrics ?? {},
  };
}

async function readState(): Promise<AnalyticsState> {
  try {
    const parsed = JSON.parse(await readFile(storePath, "utf8")) as AnalyticsState;
    return { updatedAt: parsed.updatedAt ?? new Date().toISOString(), daily: (parsed.daily ?? []).map(ensureDay) };
  } catch {
    return { updatedAt: new Date().toISOString(), daily: [] };
  }
}

async function writeState(state: AnalyticsState) {
  await mkdir(path.dirname(storePath), { recursive: true });
  const temporaryPath = `${storePath}.${process.pid}.${Date.now()}.next`;
  await writeFile(temporaryPath, JSON.stringify(state, null, 2), "utf8");
  await rename(temporaryPath, storePath);
}

export function recordAnalyticsEvent(input: AnalyticsEvent) {
  const eventName = clean(input.eventName, 40);
  if (!allowedEvents.has(eventName)) return Promise.resolve(false);

  const task = writeQueue.then(async () => {
    const state = await readState();
    const parts = analyticsParts();
    const date = `${parts.year}-${parts.month}-${parts.day}`;
    let day = state.daily.find((item) => item.date === date);
    if (!day) {
      day = emptyDay(date);
      state.daily.push(day);
    }

    day.total += 1;
    increment(day.events, eventName);
    increment(day.pages, clean(input.pagePath, 100).split("?")[0]);
    increment(day.pageGroups, clean(input.pageGroup, 40));
    increment(day.elements, clean(input.elementKey, 80));
    increment(day.devices, clean(input.deviceType, 12));
    increment(day.browsers, clean(input.browserGroup, 12));
    increment(day.referrers, clean(input.referrerGroup, 14));
    increment(day.campaigns, clean(input.utmCampaign, 64));
    increment(day.themes, clean(input.theme, 12));
    increment(day.themeSources, clean(input.themeSource, 12));
    increment(day.modes, clean(input.mode, 20));
    increment(day.sources, clean(input.source, 40));
    increment(day.hours, parts.hour ?? "00");
    increment(day.viewports, clean(input.viewport, 20));
    increment(day.languages, clean(input.language, 12));

    if (input.durationMs !== undefined) {
      const durationKey = eventName === "page_leave" ? "visit_duration_ms" : eventName.startsWith("search_") ? "search_duration_ms" : `${eventName}_duration_ms`;
      recordMetric(day.metrics, durationKey, input.durationMs);
    }
    if (eventName === "web_vital") recordMetric(day.metrics, clean(input.metricName, 24), input.metricValue);
    day.productsShown += Math.round(finite(input.productCount, 0, 100));
    if (eventName.includes("error") || input.result === "error") day.errors += 1;

    state.daily = state.daily.sort((a, b) => a.date.localeCompare(b.date)).slice(-730);
    state.updatedAt = new Date().toISOString();
    await writeState(state);
    return true;
  });
  writeQueue = task.then(() => undefined, () => undefined);
  return task;
}

function mergeCounts(target: Record<string, number>, source: Record<string, number>) {
  for (const [key, value] of Object.entries(source)) increment(target, key, value);
}

function mergeMetrics(target: Record<string, MetricAggregate>, source: Record<string, MetricAggregate>) {
  for (const [key, value] of Object.entries(source)) {
    const current = target[key];
    target[key] = current
      ? { sum: current.sum + value.sum, count: current.count + value.count, min: Math.min(current.min, value.min), max: Math.max(current.max, value.max) }
      : { ...value };
  }
}

function ranked(record: Record<string, number>, limit = 8) {
  return Object.entries(record).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, value]) => ({ label, value }));
}

export async function getAnalyticsSnapshot(days = 30) {
  const state = await readState();
  const daily = state.daily.slice(-Math.max(1, Math.min(days, 730)));
  const totals = daily.reduce((acc, day) => {
    acc.events += day.total;
    acc.pageviews += day.events.page_view ?? 0;
    acc.pageLeaves += day.events.page_leave ?? 0;
    acc.cta += day.events.cta_click ?? 0;
    acc.telegram += day.events.telegram_click ?? 0;
    acc.searches += day.events.search_submit ?? 0;
    acc.searchSuccess += day.events.search_success ?? 0;
    acc.searchRejected += day.events.search_rejected ?? 0;
    acc.engaged += day.events.engaged_visit ?? 0;
    acc.articleStarts += day.events.article_create_start ?? 0;
    acc.articleSaves += day.events.article_save ?? 0;
    acc.favoriteSaves += day.events.favorite_save ?? 0;
    acc.profiles += (day.events.profile_register ?? 0) + (day.events.profile_login ?? 0);
    acc.productsShown += day.productsShown ?? 0;
    acc.errors += day.errors;
    return acc;
  }, { events: 0, pageviews: 0, pageLeaves: 0, cta: 0, telegram: 0, searches: 0, searchSuccess: 0, searchRejected: 0, engaged: 0, articleStarts: 0, articleSaves: 0, favoriteSaves: 0, profiles: 0, productsShown: 0, errors: 0 });

  const dimensions = { pages: {}, devices: {}, browsers: {}, referrers: {}, themes: {}, themeSources: {}, modes: {}, sources: {}, hours: {}, campaigns: {} } as Record<string, Record<string, number>>;
  const metrics: Record<string, MetricAggregate> = {};
  for (const day of daily) {
    mergeCounts(dimensions.pages, day.pages); mergeCounts(dimensions.devices, day.devices); mergeCounts(dimensions.browsers, day.browsers);
    mergeCounts(dimensions.referrers, day.referrers); mergeCounts(dimensions.themes, day.themes); mergeCounts(dimensions.themeSources, day.themeSources);
    mergeCounts(dimensions.modes, day.modes); mergeCounts(dimensions.sources, day.sources); mergeCounts(dimensions.hours, day.hours);
    mergeCounts(dimensions.campaigns, day.campaigns); mergeMetrics(metrics, day.metrics);
  }

  return {
    updatedAt: state.updatedAt,
    daily,
    totals,
    rates: {
      engaged: totals.pageviews ? totals.engaged / totals.pageviews : 0,
      searchSuccess: totals.searches ? totals.searchSuccess / totals.searches : 0,
      articlePublish: totals.articleStarts ? totals.articleSaves / totals.articleStarts : 0,
    },
    averages: {
      searchMs: metrics.search_duration_ms?.count ? metrics.search_duration_ms.sum / metrics.search_duration_ms.count : 0,
      visitMs: metrics.visit_duration_ms?.count ? metrics.visit_duration_ms.sum / metrics.visit_duration_ms.count : 0,
      products: totals.searchSuccess ? totals.productsShown / totals.searchSuccess : 0,
    },
    vitals: ["LCP", "INP", "CLS", "TTFB"].map((name) => ({
      name,
      average: metrics[name]?.count ? metrics[name].sum / metrics[name].count : 0,
      samples: metrics[name]?.count ?? 0,
    })),
    rankings: {
      pages: ranked(dimensions.pages), devices: ranked(dimensions.devices), browsers: ranked(dimensions.browsers),
      referrers: ranked(dimensions.referrers), themes: ranked(dimensions.themes), modes: ranked(dimensions.modes),
      sources: ranked(dimensions.sources), hours: ranked(dimensions.hours, 24), campaigns: ranked(dimensions.campaigns),
    },
  };
}

export function analyticsToCsv(snapshot: Awaited<ReturnType<typeof getAnalyticsSnapshot>>) {
  const header = "date,total,pageviews,engaged,searches,search_success,search_rejected,products_shown,article_starts,article_saves,favorites,profiles,errors";
  const rows = snapshot.daily.map((day) => [
    day.date, day.total, day.events.page_view ?? 0, day.events.engaged_visit ?? 0, day.events.search_submit ?? 0,
    day.events.search_success ?? 0, day.events.search_rejected ?? 0, day.productsShown ?? 0, day.events.article_create_start ?? 0,
    day.events.article_save ?? 0, day.events.favorite_save ?? 0, (day.events.profile_register ?? 0) + (day.events.profile_login ?? 0), day.errors,
  ].join(","));
  return [header, ...rows].join("\n");
}
