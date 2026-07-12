import { NextResponse } from "next/server";

type SearchMode = "skin" | "hair" | "perfume";
type MarketplaceLink = { label: string; href: string };
type Product = { name: string; category: string; reason: string; rating: number; price?: string; image?: string; imageKind?: "catalog" | "category-visual"; marketplaces?: MarketplaceLink[] };
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
    { name: "Purito Oat-in Calming Gel Cream", category: "Увлажнение", reason: "Лёгкий крем для спокойного базового ухода без тяжёлого финиша.", rating: 4.8, price: "1 600–2 300 ₽", image: "/beauty-products-portal.png" },
    { name: "COSRX Low pH Good Morning Gel Cleanser", category: "Очищение", reason: "Мягкое ежедневное очищение без ощущения плёнки.", rating: 4.7, price: "900–1 500 ₽", image: "/beauty-products-portal.png" },
    { name: "Beauty of Joseon Relief Sun SPF50+", category: "Защита", reason: "Комфортный ежедневный SPF с лёгким финишем.", rating: 4.8, price: "1 400–2 100 ₽", image: "/beauty-products-portal.png" },
  ],
  hair: [
    { name: "Lador Dermatical Hair-Loss Shampoo", category: "Шампунь", reason: "Бережное очищение кожи головы без перегруза длины.", rating: 4.7, price: "1 000–1 600 ₽", image: "/beauty-products-portal.png" },
    { name: "Olaplex No.5 Bond Maintenance Conditioner", category: "Кондиционер", reason: "Поддерживает повреждённую и окрашенную длину.", rating: 4.8, price: "2 600–3 900 ₽", image: "/beauty-products-portal.png" },
    { name: "CHI 44 Iron Guard", category: "Термозащита", reason: "Помогает защитить длину при регулярной горячей укладке.", rating: 4.7, price: "1 100–1 800 ₽", image: "/beauty-products-portal.png" },
  ],
  perfume: [
    { name: "Maison Margiela Replica Lazy Sunday Morning", category: "Чистый мускус", reason: "Светлый хлопковый аромат для офиса и близкой дистанции.", rating: 4.7, price: "7 500–13 000 ₽", image: "/perfume-margiela.svg" },
    { name: "Jo Malone Wood Sage & Sea Salt", category: "Минеральная свежесть", reason: "Соль, шалфей и прозрачная древесность без сладости.", rating: 4.8, price: "8 000–14 500 ₽", image: "/perfume-jo-malone.svg" },
    { name: "Diptyque Eau Duelle", category: "Тёплая ваниль", reason: "Ваниль со специями без кондитерской тяжести.", rating: 4.8, price: "11 000–18 000 ₽", image: "/perfume-diptyque.svg" },
  ],
};

// AI is never allowed to invent image URLs. The verification pass approves the
// recommendation text, then a local, curated visual is selected by direction.
// This keeps every card visually coherent and prevents a wrong product photo.
const modeVisual: Record<SearchMode, string> = {
  skin: "/recommendations/skin-packshot-v1.png",
  hair: "/recommendations/hair-packshot-v1.png",
  perfume: "/recommendations/perfume-packshot-v1.png",
};

function safeProductVisual(mode: SearchMode) {
  return modeVisual[mode];
}

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
    price: product.price,
    image: safeProductVisual(mode),
    imageKind: "category-visual",
    marketplaces: marketplaceLinks(product.name || defaults[index % defaults.length].name, product.marketplaces),
  }));
}

async function verifyRecommendations(baseUrl: string, key: string, mode: SearchMode, query: string, candidates: Product[]) {
  const candidateText = JSON.stringify(candidates.map(({ name, category, reason }) => ({ name, category, reason })));
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `Ты второй агент-проверяющий платформы «Красавица». Проверь, что каждый кандидат реально существует, относится к направлению ${modeRules[mode].label} и соответствует запросу пользователя. Удали неподходящие, дублирующиеся или вымышленные варианты. Не выдумывай цену, рейтинг или ссылку на изображение. Верни только JSON формата {"products":[{"name":"точное название","category":"роль","reason":"краткое объяснение"}]}.` },
        { role: "user", content: `Запрос: ${query}\nКандидаты первого агента: ${candidateText}` },
      ],
    }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const envelope = safeJson<{ choices?: Array<{ message?: { content?: string } }> }>(await response.text());
  const content = envelope?.choices?.[0]?.message?.content?.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return content ? safeJson<RecommendationPayload>(content) : null;
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
      const verified = await verifyRecommendations(baseUrl, key, mode, query, parsed.products ?? []);
      const checkedProducts = verified?.products?.length ? verified.products : parsed.products;
      return NextResponse.json({ summary: parsed.summary ?? "Собрала подборку по вашему запросу.", products: normalizeProducts(mode, checkedProducts), source: verified?.products?.length ? "ai-verified" : "ai" });
    } catch {
      return NextResponse.json({ summary: "AI-провайдер временно недоступен. Показываю проверенный базовый набор.", products: normalizedFallback(mode), source: "catalog" });
    }
  } catch {
    return NextResponse.json({ error: "Не удалось обработать запрос. Попробуйте ещё раз." }, { status: 500 });
  }
}
