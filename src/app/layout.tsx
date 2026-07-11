import type { Metadata, Viewport } from "next";
import { PointerGlow } from "@/components/pointer-glow";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { RouteTransition } from "@/components/route-transition";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://krasavitsa.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Красавица — подбор ухода и косметики",
    template: "%s",
  },
  description:
    "Красавица помогает подобрать уход, разобраться с кожей, сохранить рекомендации и спокойнее выбирать косметику.",
  applicationName: "Красавица",
  keywords: [
    "Красавица",
    "подбор ухода",
    "подбор косметики",
    "уход за кожей",
    "Telegram бот косметика",
  ],
  authors: [{ name: "Красавица" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Красавица — подбор ухода и косметики",
    description: "Спокойный beauty-помощник для понятного выбора ухода.",
    url: siteUrl,
    siteName: "Красавица",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 640,
        height: 640,
        alt: "Логотип Красавица",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Красавица — подбор ухода и косметики",
    description: "Помощник для осознанного выбора косметического ухода.",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#FCFAFB",
  colorScheme: "light",
};

const bootLoaderScript = `
(() => {
  const root = document.getElementById("boot-loader");
  const value = document.getElementById("boot-loader-value");
  if (!root || !value) return;

  const isHome = window.location.pathname === "/" || window.location.pathname === "";
  if (!isHome) {
    root.remove();
    return;
  }

  root.classList.add("is-active");
  root.removeAttribute("aria-hidden");

  let count = 0;
  let appReady = false;
  let countReady = false;
  const startedAt = Date.now();
  const minDuration = 2200;

  const finish = () => {
    if (!appReady || !countReady) return;
    const remaining = Math.max(0, minDuration - (Date.now() - startedAt));
    window.setTimeout(() => {
      root.classList.add("is-complete");
      window.setTimeout(() => root.remove(), 720);
    }, remaining);
  };

  window.__krasavitsaAppReady = () => {
    appReady = true;
    finish();
  };

  window.setTimeout(() => {
    appReady = true;
    finish();
  }, 6500);

  const tick = () => {
    count = Math.min(100, count + 1 + Math.floor(Math.random() * 3));
    value.textContent = String(count);
    if (count >= 100) {
      countReady = true;
      value.textContent = "100";
      finish();
      return;
    }
    window.setTimeout(tick, 18 + Math.floor(Math.random() * 22));
  };

  window.setTimeout(tick, 40);
})();
`;

const themeScript = `
(() => {
  try {
    const stored = window.localStorage.getItem("krasavitsa-theme");
    const theme = stored === "dark" || stored === "light"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div id="boot-loader" aria-hidden="true">
          <div id="boot-loader-value" suppressHydrationWarning>
            0
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: bootLoaderScript }} />
        <PointerGlow />
        <AnalyticsTracker />
        <RouteTransition />
        {children}
      </body>
    </html>
  );
}
