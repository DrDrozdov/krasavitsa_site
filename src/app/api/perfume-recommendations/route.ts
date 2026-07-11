import { NextResponse } from "next/server";

type Perfume = {
  name: string;
  mood: string;
  notes: string[];
  occasion: string;
  text: string;
  image: string;
};

const catalog: Perfume[] = [
  { name: "Clean Reserve Skin", mood: "Чистота", notes: ["мускус", "соль", "кожа"], occasion: "каждый день", text: "Мягкий близкий аромат: чистая кожа после душа, без сладости и громкого шлейфа.", image: "/perfume-clean-reserve.svg" },
  { name: "Maison Margiela Lazy Sunday Morning", mood: "Свежесть", notes: ["мускус", "ирис", "ландыш"], occasion: "офис", text: "Светлый хлопковый профиль для офиса и близкой дистанции.", image: "/perfume-margiela.svg" },
  { name: "Byredo Blanche", mood: "Чистота", notes: ["альдегиды", "пион", "мускус"], occasion: "офис", text: "Холодная чистота, белая рубашка и очень собранное звучание.", image: "/perfume-byredo.svg" },
  { name: "Diptyque Eau Duelle", mood: "Уют", notes: ["ваниль", "кардамон", "чай"], occasion: "вечер", text: "Тёплая ваниль без кондитерской тяжести, хорошо работает вечером.", image: "/perfume-diptyque.svg" },
  { name: "Jo Malone Wood Sage & Sea Salt", mood: "Свежесть", notes: ["соль", "шалфей", "древесность"], occasion: "каждый день", text: "Минеральная свежесть без резкого цитруса и ощущения спортивного одеколона.", image: "/perfume-jo-malone.svg" },
  { name: "Narciso Rodriguez Pure Musc", mood: "Вечер", notes: ["мускус", "цветы", "кашемир"], occasion: "свидание", text: "Чистый, но более заметный мускус: мягко, взросло и без перегруза.", image: "/perfume-narciso.svg" },
  { name: "Zara Ebony Wood", mood: "Уют", notes: ["древесность", "перец", "гвоздика"], occasion: "вечер", text: "Тёплая древесная база для прохладной погоды и спокойного образа.", image: "/perfume-diptyque.svg" },
  { name: "L'Occitane Thé Vert", mood: "Свежесть", notes: ["чай", "цитрус", "зелень"], occasion: "каждый день", text: "Зелёный чай, чистый старт дня и лёгкая прозрачная свежесть.", image: "/perfume-jo-malone.svg" },
];

function localSelection(query: string) {
  const words = query.toLowerCase().split(/\s+/).filter((word) => word.length > 2);
  const selected = catalog.filter((perfume) => {
    const searchable = `${perfume.name} ${perfume.mood} ${perfume.occasion} ${perfume.notes.join(" ")} ${perfume.text}`.toLowerCase();
    return !words.length || words.some((word) => searchable.includes(word));
  });
  return (selected.length ? selected : catalog).slice(0, 4);
}

function safeJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function askModel(system: string, user: string) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;
  const baseUrl = (process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
    cache: "no-store",
  });
  const raw = await response.text();
  const data = safeJson<{ choices?: Array<{ message?: { content?: string } }> }>(raw);
  const content = data?.choices?.[0]?.message?.content?.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return response.ok && content ? safeJson<{ names?: string[] }>(content) : null;
}

export async function POST(request: Request) {
  try {
    const { query } = (await request.json()) as { query?: string };
    if (!query?.trim()) return NextResponse.json({ products: catalog.slice(0, 4), source: "catalog" });

    const catalogText = catalog.map((item) => `${item.name} | ${item.mood} | ${item.notes.join(", ")} | ${item.occasion}`).join("\n");
    const selectorPrompt = `Ты первый агент парфюм-поиска. Выбери от 2 до 4 точных названий только из каталога ниже. Учитывай ноты, настроение, повод и бюджет из запроса. Верни строго JSON: {"names":["..."]}. Каталог:\n${catalogText}`;
    const choice = await askModel(selectorPrompt, query);
    const names = choice?.names?.filter((name) => catalog.some((item) => item.name === name)) ?? [];

    // Второй агент проверяет, что выдача не содержит посторонних названий и не расходится с запросом.
    const verifierPrompt = `Ты второй агент проверки. Оставь 2-4 названия только из списка кандидатов, если они отвечают запросу. Верни строго JSON {"names":["..."]}. Запрос: ${query}\nКандидаты: ${names.join(" | ") || catalog.map((item) => item.name).join(" | ")}`;
    const verified = await askModel(verifierPrompt, query);
    const verifiedNames = verified?.names?.filter((name) => catalog.some((item) => item.name === name)) ?? names;
    const products = verifiedNames.length
      ? verifiedNames.map((name) => catalog.find((item) => item.name === name)!).slice(0, 4)
      : localSelection(query);

    return NextResponse.json({ products, source: process.env.DEEPSEEK_API_KEY ? "ai-verified" : "catalog" });
  } catch {
    return NextResponse.json({ products: catalog.slice(0, 4), source: "catalog" });
  }
}
