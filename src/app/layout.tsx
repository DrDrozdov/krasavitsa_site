import type { Metadata, Viewport } from "next";
import { PointerGlow } from "@/components/pointer-glow";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { CookieConsent } from "@/components/cookie-consent";
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
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
};

const themeScript = `
(() => {
  const preferenceKey = "krasavitsa-theme-preference";
  const schemaKey = "krasavitsa-theme-schema";
  const schemaVersion = "3";
  let preference = "system";
  try {
    if (window.localStorage.getItem(schemaKey) !== schemaVersion) {
      window.localStorage.removeItem("krasavitsa-theme");
      window.localStorage.removeItem("krasavitsa-theme-source");
      window.localStorage.removeItem(preferenceKey);
      window.localStorage.setItem(schemaKey, schemaVersion);
    }
    const stored = window.localStorage.getItem(preferenceKey);
    if (stored === "light" || stored === "dark") preference = stored;
  } catch {}
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const theme = preference === "system" ? systemTheme : preference;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  root.dataset.themeSource = preference === "system" ? "system" : "manual";
  root.style.colorScheme = theme;
  document.querySelector("#krasavitsa-theme-color")?.setAttribute("content", theme === "dark" ? "#160b11" : "#fff8f6");
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta id="krasavitsa-theme-color" name="theme-color" content="#fff8f6" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <PointerGlow />
        <AnalyticsTracker />
        <CookieConsent />
        {children}
      </body>
    </html>
  );
}
