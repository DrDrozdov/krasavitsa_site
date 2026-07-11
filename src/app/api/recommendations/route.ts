import { NextResponse } from "next/server";

type SearchMode = "skin" | "hair" | "perfume";
type MarketplaceLink = { label: string; href: string };
type Product = { name: string; category: string; reason: string; rating: number; marketplaces?: MarketplaceLink[] };
type RecommendationPayload = { summary?: string; products?: Product[] };

const modeRules: Record<SearchMode, { label: string; intent: string[]; system: string }> = {
  skin: {
    label: "уходе за кожей",
    intent: ["кожа", "лицо", "крем", "сывор", "очищ", "умыван", "spf", "акне", "блеск", "сух", "чувств", "покрас", "барьер", "морщ", "пигмент", "уход"],
    system: "Подбирай косметический уход за кожей. Учитывай тип кожи, чувствительность, текущий уход, бюджет, текстуры, нежелательные ингредиенты и SPF. Не ставь диагнозы и при тревожных симптомах советуй обратиться к врачу. Не предлагай больше четырёх средств и объясняй роль каждого шага.",
  },
  hair: {
    label: "уходе за волосами",
    intent: ["волос", "кожа головы", "шампун", "кондиционер", "маск", "ломк", "порист", "кудр", "окраш", "жирн", "перхот", "сухие концы", "термозащит"],
    system: "Подбирай уход за волосами и кожей головы. Учитывай тип кожи головы, длину, пористость, окрашивание, термовоздействие, частоту мытья, бюджет и переносимость отдушек. Разделяй задачи кожи головы и полотна волос. Не обещай лечение выпадения или заболеваний; при зуде, язвах и выраженном выпадении советуй врача-трихолога.",
  },
  perfume: {
    label: "ароматах",
    intent: ["аромат", "парфюм", "духи", "запах", "нота", "шлейф", "мускус", "ваниль", "ирис", "цвет", "древес", "цитрус", "свеж", "слад", "пудр", "офис", "вечер", "свидан", "флакон"],
    system: "Подбирай парфюмерию по любимым и нежелательным нотам, настроению, сезону, поводу, громкости шлейфа и бюджету. Предлагай только реально существующие ароматы с точными названиями. Объясняй характер звучания простым языком и напоминай тестировать аромат на коже перед покупкой.",
  },
};

const fallback: Record<SearchMode, Product[]> = {
  skin: [
    { name: "Purito Oat-in Calming Gel Cream", category: "Увлажнение", reason: "Лёгкий крем для спокойного базового ухода без тяжёлого финиша.", rating: 4.8 },
    { name: "COSRX Low pH Good Morning Gel Cleanser", category: "Очищение", reason: "Мягкое ежедневное очищение без ощущения плёнки.", rating: 4.7 },
    { name: "Beauty of Joseon Relief Sun SPF50+", category: "Защита", reason: "Комфортный ежедневный SPF с лёгким финишем.", rating: 4.8 },
  ],
  hair: [
    { name: "Lador Dermatical Hair-Loss Shampoo", category: "Шампунь", reason: "Бережное очищение кожи головы без перегруза длины.", rating: 4.7 },
    { name: "Olaplex No.5 Bond Maintenance Conditioner", category: "Кондиционер", reason: "Поддерживает повреждённую и окрашенную длину.", rating: 4.8 },
    { name: "CHI 44 Iron Guard", category: "Термозащита", reason: "Помогает защитить длину при регулярной горячей укладке.", rating: 4.7 },
  ],
  perfume: [
    { name: "Maison Margiela Replica Lazy Sunday Morning", category: "Чистый мускус", reason: "Светлый хлопковый аромат для офиса и близкой дистанции.", rating: 4.7 },
    { name: "Jo Malone Wood Sage & Sea Salt", category: "Минеральная свежесть", reason: "Соль, шалфей и прозрачная древесность без сладости.", rating: 4.8 },
    { name: "Diptyque Eau Duelle", category: "Тёплая ваниль", reason: "Ваниль со специями без кондитерской тяжести.", rating: 4.8 },
  ],
};

function marketplaceLinks(name: string, provided?: MarketplaceLink[]) {
  const query = encodeURIComponent(name);
  const links = [
    { label: "Я.Маркет", href: `https://market.yandex.ru/search?text=${query}` },
    { label: "Ozon", href: `https://www.ozon.ru/search/?text=${query}` },
    { label: "WB", href: `https://www.wildberries.ru/catalog/0/search.aspx?search=${query}` },
    { label: "ЗЯ", href: `https://goldapple.ru/search?q=${query}` },
    { label: "Лэтуаль", href: `https://www.letu.ru/search?q=${query}` },
  ];
  return [...(provided ?? []), ...links].filter((item, index, array) => item.label && item.href && array.findIndex((candidate) => candidate.href === item.href) === index).slice(0, 5);
}

function normalizedFallback(mode: SearchMode) {
  return fallback[mode].map((product) => ({ ...product, marketplaces: marketplaceLinks(product.name) }));
}

function validRequest(query: string, mode: SearchMode) {
  const normalized = query.toLowerCase().replace(/[^а-яёa-z0-9\s-]/gi, " ");
  return normalized.length >= 8 && modeRules[mode].intent.some((word) => normalized.includes(word));
}

function safeJson<T>(value: string): T | null {
  try { return JSON.parse(value) as T; } catch { return null; }
}

function normalizeProducts(mode: SearchMode, products?: Product[]) {
  const defaults = fallback[mode];
  const source = Array.isArray(products) && products.length ? products.slice(0, 4) : defaults;
  return source.map((product, index) => ({
    name: product.name || defaults[index % defaults.length].name,
    category: product.category || defaults[index % defaults.length].category,
    reason: product.reason || defaults[index % defaults.length].reason,
    rating: Math.min(5, Math.max(1, Number(product.rating) || 4.7)),
    marketplaces: marketplaceLinks(product.name || defaults[index % defaults.length].name, product.marketplaces),
  }));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string; mode?: SearchMode };
    const query = body.query?.trim() ?? "";
    const mode: SearchMode = body.mode && body.mode in modeRules ? body.mode : "skin";
    if (query.length < 6) return NextResponse.json({ error: "Опишите задачу чуть подробнее: цель, ограничения и бюджет." }, { status: 400 });
    if (query.length > 1200) return NextResponse.json({ error: "Сократите запрос до 1200 символов." }, { status: 413 });
    if (!validRequest(query, mode)) {
      return NextResponse.json({ error: `Сейчас я помогаю с ${modeRules[mode].label}. Уточните задачу, желаемый эффект, ограничения или бюджет.` }, { status: 422 });
    }

    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) return NextResponse.json({ summary: "Показываю базовую подборку по выбранному направлению.", products: normalizedFallback(mode), source: "catalog" });
    const baseUrl = (process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com").replace(/\/$/, "");
    const format = 'Верни только JSON: {"summary":"краткий вывод", "products":[{"name":"точный бренд и название", "category":"роль", "reason":"почему подходит", "rating":4.7}]}. Дай 3–4 реально существующих варианта. Не выдумывай медицинские свойства, цены и рейтинги.';
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: `Ты консультант платформы «Красавица». ${modeRules[mode].system} ${format}` },
            { role: "user", content: query },
          ],
        }),
        cache: "no-store",
      });
      const raw = await response.text();
      const envelope = safeJson<{ choices?: Array<{ message?: { content?: string } }> }>(raw);
      const content = envelope?.choices?.[0]?.message?.content?.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = content ? safeJson<RecommendationPayload>(content) : null;
      if (!response.ok || !parsed) return NextResponse.json({ summary: "AI-провайдер временно недоступен. Показываю проверенный базовый набор.", products: normalizedFallback(mode), source: "catalog" });
      return NextResponse.json({ summary: parsed.summary ?? "Собрала подборку по вашему запросу.", products: normalizeProducts(mode, parsed.products), source: "ai" });
    } catch {
      return NextResponse.json({ summary: "AI-провайдер временно недоступен. Показываю проверенный базовый набор.", products: normalizedFallback(mode), source: "catalog" });
    }
  } catch {
    return NextResponse.json({ error: "Не удалось обработать запрос. Попробуйте ещё раз." }, { status: 500 });
  }
}
