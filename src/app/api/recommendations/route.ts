import { NextResponse } from "next/server";

type Product = {
  name: string;
  category: string;
  reason: string;
  rating: number;
  marketplace: string;
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
    marketplace: "https://market.yandex.ru/",
  },
  {
    name: "COSRX Low pH Good Morning Gel Cleanser",
    category: "Очищение",
    reason: "Мягкое ежедневное очищение без ощущения пленки и перегруза.",
    rating: 4.7,
    marketplace: "https://www.ozon.ru/",
  },
  {
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    category: "Сыворотка",
    reason: "Помогает контролировать блеск и поддерживать ровный тон.",
    rating: 4.6,
    marketplace: "https://www.wildberries.ru/",
  },
];

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
    marketplace: product.marketplace || "https://market.yandex.ru/",
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
                  "Ты Beauty OS «Красавица», AI-платформа для осознанного подбора косметического ухода. Отвечай только валидным JSON без markdown. Формат: {\"summary\":\"короткий вывод на русском\", \"products\":[{\"name\":\"название средства\", \"category\":\"категория\", \"reason\":\"почему подходит\", \"rating\":4.8, \"marketplace\":\"https://...\"}]}. Дай 3-4 продукта. Не ставь медицинские диагнозы, не обещай лечение, учитывай бюджет и ограничения пользователя.",
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
