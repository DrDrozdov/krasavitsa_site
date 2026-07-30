import { Store } from "lucide-react";

type MarketplaceKind = "goldapple" | "letoile" | "ozon" | "wildberries" | "yandex" | "store";

function identifyMarketplace(label: string, href: string): MarketplaceKind {
  const source = `${label} ${href}`.toLocaleLowerCase("ru-RU");

  if (source.includes("goldapple") || source.includes("gold apple") || source.includes("золот")) return "goldapple";
  if (source.includes("letoile") || source.includes("летуал") || source.includes("л'этуаль") || source.includes("л’этуаль")) return "letoile";
  if (source.includes("ozon") || source.includes("озон")) return "ozon";
  if (source.includes("wildberries") || source.includes("вайлдберриз") || source.includes("wb.ru")) return "wildberries";
  if (source.includes("market.yandex") || source.includes("маркет") || source.includes("yandex")) return "yandex";

  return "store";
}

function GoldAppleMark() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Золотое яблоко">
      <defs>
        <linearGradient id="gold-apple-mark" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9DC92" />
          <stop offset="0.5" stopColor="#B98836" />
          <stop offset="1" stopColor="#6D4319" />
        </linearGradient>
      </defs>
      <path d="M12.1 7.1c-1.7-2-5.2-1.7-7 .4C2.2 11 5 18.9 8.5 20.3c1.2.5 2.2-.5 3.5-.5s2.3 1 3.5.5C19 18.9 21.8 11 19 7.5c-1.8-2.2-5.3-2.4-6.9-.4Z" fill="url(#gold-apple-mark)" />
      <path d="M12.3 6.8c.2-2.2 1.7-3.8 4.1-4.1-.1 2.2-1.6 3.8-4.1 4.1Z" fill="#5D782E" />
      <path d="M9.2 8.5c-1.6.2-2.8 1.4-3.1 3" fill="none" stroke="#FFF7E5" strokeLinecap="round" strokeWidth="1.15" />
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
      {kind === "store" ? <Store /> : null}
    </span>
  );
}
