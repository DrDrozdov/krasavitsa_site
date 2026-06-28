import type { Metadata, Viewport } from "next";
import { PointerGlow } from "@/components/pointer-glow";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body>
        <PointerGlow />
        {children}
      </body>
    </html>
  );
}
