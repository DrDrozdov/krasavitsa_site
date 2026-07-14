import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
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
};

export type DailyAnalytics = {
  date: string;
  total: number;
  events: Record<string, number>;
  pages: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  referrers: Record<string, number>;
  campaigns: Record<string, number>;
  errors: number;
};

type AnalyticsState = {
  updatedAt: string;
  daily: DailyAnalytics[];
};

const allowedEvents = new Set([
  "page_view", "page_leave", "engaged_visit", "scroll_depth", "cta_click", "telegram_click", "navigation_click", "search_submit", "search_success", "search_rejected", "article_save", "article_like", "article_delete", "profile_register", "profile_login", "form_error", "bot_action", "bot_error",
]);

const storePath = process.env.ANALYTICS_DATA_DIR
  ? path.join(process.env.ANALYTICS_DATA_DIR, "analytics.json")
  : path.join(process.cwd(), ".data", "analytics.json");

let writeQueue = Promise.resolve();

function analyticsDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.ANALYTICS_TIME_ZONE ?? "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function clean(value: unknown, max = 80) {
  return typeof value === "string" ? value.replace(/[^\p{L}\p{N}_./ -]/gu, "").slice(0, max) : "";
}

function increment(record: Record<string, number>, key: string) {
  if (key) record[key] = (record[key] ?? 0) + 1;
}

async function readState(): Promise<AnalyticsState> {
  try {
    return JSON.parse(await readFile(storePath, "utf8")) as AnalyticsState;
  } catch {
    return { updatedAt: new Date().toISOString(), daily: [] };
  }
}

async function writeState(state: AnalyticsState) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(state, null, 2), "utf8");
}

export function recordAnalyticsEvent(input: AnalyticsEvent) {
  const eventName = clean(input.eventName, 40);
  if (!allowedEvents.has(eventName)) return Promise.resolve(false);

  const task = writeQueue.then(async () => {
    const state = await readState();
    const date = analyticsDate();
    let day = state.daily.find((item) => item.date === date);
    if (!day) {
      day = { date, total: 0, events: {}, pages: {}, devices: {}, browsers: {}, referrers: {}, campaigns: {}, errors: 0 };
      state.daily.push(day);
    }
    day.total += 1;
    increment(day.events, eventName);
    increment(day.pages, clean(input.pagePath, 100).split("?")[0]);
    increment(day.devices, clean(input.deviceType, 12));
    increment(day.browsers, clean(input.browserGroup, 12));
    increment(day.referrers, clean(input.referrerGroup, 14));
    increment(day.campaigns, clean(input.utmCampaign, 64));
    if (eventName.includes("error") || input.result === "error") day.errors += 1;
    state.daily = state.daily.slice(-730);
    state.updatedAt = new Date().toISOString();
    await writeState(state);
    return true;
  });
  writeQueue = task.then(() => undefined, () => undefined);
  return task;
}

export async function getAnalyticsSnapshot(days = 30) {
  const state = await readState();
  const daily = state.daily.slice(-Math.max(1, Math.min(days, 730)));
  const totals = daily.reduce((acc, day) => {
    acc.events += day.total;
    acc.pageviews += day.events.page_view ?? 0;
    acc.cta += day.events.cta_click ?? 0;
    acc.telegram += day.events.telegram_click ?? 0;
    acc.searches += day.events.search_submit ?? 0;
    acc.searchSuccess += day.events.search_success ?? 0;
    acc.searchRejected += day.events.search_rejected ?? 0;
    acc.engaged += day.events.engaged_visit ?? 0;
    acc.errors += day.errors;
    return acc;
  }, { events: 0, pageviews: 0, cta: 0, telegram: 0, searches: 0, searchSuccess: 0, searchRejected: 0, engaged: 0, errors: 0 });
  return { updatedAt: state.updatedAt, daily, totals };
}

export function analyticsToCsv(snapshot: Awaited<ReturnType<typeof getAnalyticsSnapshot>>) {
  const header = "date,total,pageviews,cta_clicks,telegram_clicks,searches,search_success,search_rejected,errors";
  const rows = snapshot.daily.map((day) => [day.date, day.total, day.events.page_view ?? 0, day.events.cta_click ?? 0, day.events.telegram_click ?? 0, day.events.search_submit ?? 0, day.events.search_success ?? 0, day.events.search_rejected ?? 0, day.errors].join(","));
  return [header, ...rows].join("\n");
}
