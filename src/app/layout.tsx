import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://krasavitsa.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Красавица Beauty OS - AI-подбор косметического ухода",
    template: "%s | Красавица Beauty OS",
  },
  description:
    "Premium AI-платформа для осознанного выбора косметики: персональный подбор ухода, рейтинг сообщества и Telegram-бот.",
  applicationName: "Красавица Beauty OS",
  keywords: [
    "Красавица",
    "Beauty OS",
    "AI подбор косметики",
    "уход за кожей",
    "Telegram бот косметика",
  ],
  authors: [{ name: "Красавица Beauty OS" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Красавица Beauty OS",
    description: "AI, который помогает выбирать косметику осознанно.",
    url: siteUrl,
    siteName: "Красавица Beauty OS",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 640,
        height: 640,
        alt: "Логотип Красавица Beauty OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Красавица Beauty OS",
    description: "AI-платформа для осознанного выбора косметического ухода.",
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
      <body>{children}</body>
    </html>
  );
}
