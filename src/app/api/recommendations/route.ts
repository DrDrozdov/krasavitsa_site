import { NextResponse } from "next/server";

type Product = {
  name: string;
  category: string;
  reason: string;
  rating: number;
  marketplace?: string;
  marketplaces?: MarketplaceLink[];
};

type MarketplaceLink = {
  label: string;
  href: string;
};

type RecommendationPayload = {
  summary?: string;
  products?: Product[];
};

const fallbackProducts: Product[] = [
  {
    name: "Purito Oat-in Calming Gel Cream",
    category: "Увлажняющий крем",
    reason: "Легкая текстура, спокойный финиш и комфорт для кожи, склонной к жирности.",
    rating: 4.8,
    marketplaces: marketplaceLinks("Purito Oat-in Calming Gel Cream"),
  },
  {
    name: "COSRX Low pH Good Morning Gel Cleanser",
    category: "Очищение",
    reason: "Мягкое ежедневное очищение без ощущения пленки и перегруза.",
    rating: 4.7,
    marketplaces: marketplaceLinks("COSRX Low pH Good Morning Gel Cleanser"),
  },
  {
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    category: "Сыворотка",
    reason: "Помогает контролировать блеск и поддерживать ровный тон.",
    rating: 4.6,
    marketplaces: marketplaceLinks("The Ordinary Niacinamide 10% + Zinc 1%"),
  },
];

function marketplaceLinks(name: string, provided?: MarketplaceLink[], fallback?: string): MarketplaceLink[] {
  const query = encodeURIComponent(name);
  const links: MarketplaceLink[] = [
    { label: "Я.Маркет", href: `https://market.yandex.ru/search?text=${query}` },
    { label: "Ozon", href: `https://www.ozon.ru/search/?text=${query}` },
    { label: "WB", href: `https://www.wildberries.ru/catalog/0/search.aspx?search=${query}` },
    { label: "ЗЯ", href: `https://goldapple.ru/search?q=${query}` },
    { label: "Лэтуаль", href: `https://www.letu.ru/search?q=${query}` },
  ];
  const validProvided = provided?.filter((item) => item.label && item.href) ?? [];
  const merged = fallback ? [{ label: "Магазин", href: fallback }, ...validProvided, ...links] : [...validProvided, ...links];
  return merged.filter((item, index, array) => array.findIndex((candidate) => candidate.href === item.href) === index).slice(0, 5);
}

function previewAnswer(query: string) {
  return {
    mode: "preview",
    summary:
      "Собрала демонстрационную подборку. Когда провайдер API примет ключ, здесь появится live-ответ AI.",
    query,
    products: fallbackProducts,
  };
}

function normalizeProducts(products: Product[] | undefined): Product[] {
  if (!Array.isArray(products) || products.length === 0) {
    return fallbackProducts;
  }

  return products.slice(0, 4).map((product, index) => ({
    name: product.name || fallbackProducts[index % fallbackProducts.length].name,
    category: product.category || "Средство ухода",
    reason: product.reason || "Подходит под указанные ограничения и цель ухода.",
    rating: Number(product.rating) || 4.6,
    marketplaces: marketplaceLinks(product.name || fallbackProducts[index % fallbackProducts.length].name, product.marketplaces, product.marketplace),
  }));
}

function safeJson<T>(value: string): T | null {
  if (!value.trim()) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function parseProviderResponse(response: Response) {
  const raw = await response.text();
  const data = safeJson<{
    choices?: Array<{ message?: { content?: string } }>;
  }>(raw);
  const content = data?.choices?.[0]?.message?.content;

  if (!response.ok || !content) {
    return null;
  }

  const cleanContent = content.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return safeJson<RecommendationPayload>(cleanContent);
}

export async function POST(request: Request) {
  try {
    const { query } = (await request.json()) as { query?: string };

    if (!query || query.trim().length < 6) {
      return NextResponse.json(
        { error: "Опишите задачу подробнее: тип кожи, бюджет, желаемый эффект." },
        { status: 400 },
      );
    }

    const backendUrl = process.env.BEAUTY_OS_API_URL;

    if (backendUrl) {
      try {
        const response = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
          cache: "no-store",
        });
        const raw = await response.text();
        const data = safeJson<RecommendationPayload>(raw);

        if (response.ok && data) {
          return NextResponse.json({
            summary: data.summary ?? "Собрала подборку по вашему запросу.",
            products: normalizeProducts(data.products),
          });
        }
      } catch {
        return NextResponse.json(previewAnswer(query));
      }
    }

    const deepseekKey = process.env.DEEPSEEK_API_KEY;

    if (deepseekKey) {
      try {
        const baseUrl = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
        const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${deepseekKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "Ты Beauty OS «Красавица», AI-платформа для осознанного подбора косметического ухода. Отвечай только валидным JSON без markdown. Формат: {\"summary\":\"короткий вывод на русском\", \"products\":[{\"name\":\"точное название средства и бренд\", \"category\":\"категория\", \"reason\":\"почему подходит\", \"rating\":4.8, \"marketplaces\":[{\"label\":\"Я.Маркет\", \"href\":\"https://market.yandex.ru/search?text=...\"},{\"label\":\"Ozon\", \"href\":\"https://www.ozon.ru/search/?text=...\"}]}]}. Дай 3-4 реальных продукта с точными названиями. Для ссылок используй поисковые URL конкретного названия товара на Яндекс Маркете, Ozon, Wildberries, Золотом Яблоке или Лэтуаль. Не ставь медицинские диагнозы, не обещай лечение, учитывай бюджет и ограничения пользователя.",
              },
              { role: "user", content: query },
            ],
          }),
          cache: "no-store",
        });
        const parsed = await parseProviderResponse(response);

        if (parsed) {
          return NextResponse.json({
            summary: parsed.summary ?? "Собрала подборку по вашему запросу.",
            products: normalizeProducts(parsed.products),
          });
        }
      } catch {
        return NextResponse.json(previewAnswer(query));
      }
    }

    return NextResponse.json(previewAnswer(query));
  } catch {
    return NextResponse.json(previewAnswer("Запрос пользователя"));
  }
}
