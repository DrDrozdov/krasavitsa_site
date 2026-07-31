import { Store } from "lucide-react";

type MarketplaceKind = "goldapple" | "letoile" | "ozon" | "wildberries" | "yandex" | "rivegauche" | "tsum" | "store";

function identifyMarketplace(label: string, href: string): MarketplaceKind {
  const source = `${label} ${href}`.toLocaleLowerCase("ru-RU");

  if (source.includes("goldapple") || source.includes("gold apple") || source.includes("золот")) return "goldapple";
  if (source.includes("letoile") || source.includes("летуал") || source.includes("л'этуаль") || source.includes("л’этуаль")) return "letoile";
  if (source.includes("ozon") || source.includes("озон")) return "ozon";
  if (source.includes("wildberries") || source.includes("вайлдберриз") || source.includes("wb.ru")) return "wildberries";
  if (source.includes("market.yandex") || source.includes("маркет") || source.includes("yandex")) return "yandex";
  if (source.includes("rivegauche") || source.includes("рив гош")) return "rivegauche";
  if (source.includes("tsum.ru") || source.includes("цум")) return "tsum";

  return "store";
}

function GoldAppleMark() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Золотое яблоко">
      <rect width="24" height="24" rx="7" fill="#111" />
      <text x="12" y="10.8" fill="#fff" fontFamily="Arial, sans-serif" fontSize="4.15" fontWeight="800" letterSpacing="-.18" textAnchor="middle">GOLD</text>
      <text x="12" y="15.8" fill="#fff" fontFamily="Arial, sans-serif" fontSize="4.15" fontWeight="800" letterSpacing="-.18" textAnchor="middle">APPLE</text>
    </svg>
  );
}

function RiveGaucheMark() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Рив Гош">
      <rect width="24" height="24" rx="7" fill="#F05A24" />
      <path d="M5 7.1h5.2c2.6 0 4.1 1.2 4.1 3.3 0 1.4-.7 2.4-2 2.9l2.8 3.6h-3l-2.3-3.2H7.6v3.2H5V7.1Zm2.6 2.1v2.5H10c1.1 0 1.7-.4 1.7-1.3s-.6-1.2-1.7-1.2H7.6Z" fill="#fff" />
      <path d="M15.7 7.1H19v2.3h-3.3V7.1Zm0 3.5H19v6.3h-3.3v-6.3Z" fill="#fff" />
    </svg>
  );
}

function TsumMark() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="ЦУМ">
      <rect width="24" height="24" rx="7" fill="#111" />
      <text x="12" y="14.8" fill="#fff" fontFamily="Arial, sans-serif" fontSize="7.2" fontWeight="700" letterSpacing=".3" textAnchor="middle">ЦУМ</text>
    </svg>
  );
}

function LetoileMark() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Л’Этуаль">
      <path d="m12 2 1.8 6.2L19 4.4l-3.2 5.7 6.2-.6-5.8 2.7 5 3.6-6.1-1.5.9 6.3-3.8-5.1-3 5.5.4-6.3-6 2 4.5-4.2-6.1-1.2 6.2.2L5.4 4.6l5 3.8L12 2Z" fill="currentColor" />
      <circle cx="12" cy="12" r="2.15" fill="var(--marketplace-mark-surface, #fff)" />
    </svg>
  );
}

function OzonMark() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Ozon">
      <rect width="24" height="24" rx="7" fill="#005BFF" />
      <path d="M5.1 12c0-2.1 1.5-3.7 3.7-3.7s3.7 1.6 3.7 3.7-1.5 3.7-3.7 3.7S5.1 14.1 5.1 12Zm2.2 0c0 1 .6 1.7 1.5 1.7s1.5-.7 1.5-1.7-.6-1.7-1.5-1.7-1.5.7-1.5 1.7Zm5.9-3.5h5.7v1.8l-3 3.2H19v2h-6.1v-1.8l3-3.2h-2.7v-2Z" fill="#fff" />
    </svg>
  );
}

function WildberriesMark() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Wildberries">
      <defs>
        <linearGradient id="wildberries-mark" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CB11AB" />
          <stop offset="1" stopColor="#7C0F99" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="7" fill="url(#wildberries-mark)" />
      <path d="M4.9 7.1h2.6l1.4 9 1.8-6.9h2.6l1.8 6.9 1.4-9h2.6l-2.5 10.8h-2.9L12 11l-1.7 5.9H7.4L4.9 7.1Z" fill="#fff" />
    </svg>
  );
}

function YandexMarketMark() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Яндекс Маркет">
      <rect width="24" height="24" rx="7" fill="#FFCC00" />
      <path d="M5 6.2h5.1v11.6H7.9v-4.3H5V6.2Zm2.9 2.1H7.1v3.1h.8V8.3Z" fill="#FC3F1D" />
      <path d="m11.7 6.2 2.4 4.2 2.4-4.2h2.3v11.6h-2.3v-7.4l-2.4 4-2.4-4v7.4H9.5V6.2h2.2Z" fill="#171717" />
    </svg>
  );
}

export function MarketplaceMark({ label, href, className }: { label: string; href: string; className?: string }) {
  const kind = identifyMarketplace(label, href);

  return (
    <span className={className} aria-hidden="true">
      {kind === "goldapple" ? <GoldAppleMark /> : null}
      {kind === "letoile" ? <LetoileMark /> : null}
      {kind === "ozon" ? <OzonMark /> : null}
      {kind === "wildberries" ? <WildberriesMark /> : null}
      {kind === "yandex" ? <YandexMarketMark /> : null}
      {kind === "rivegauche" ? <RiveGaucheMark /> : null}
      {kind === "tsum" ? <TsumMark /> : null}
      {kind === "store" ? <Store /> : null}
    </span>
  );
}
