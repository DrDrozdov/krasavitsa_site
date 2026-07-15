import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

type ArticleAssistBody = {
  title?: unknown;
  category?: unknown;
  excerpt?: unknown;
  content?: unknown;
};

function fallbackArticle(title: string, category: string, content: string) {
  const subject = title || `Материал о теме «${category}»`;
  const seed = content.trim();
  return {
    excerpt: seed ? seed.slice(0, 180).replace(/\s+\S*$/, "") : `${subject}: личный контекст, наблюдения и практические выводы без рекламного шума.`,
    content: seed || [
      `Начните с личного контекста: почему тема «${subject}» стала для вас важной и какой вопрос вы хотели решить.`,
      "Затем опишите, что именно вы пробовали, какие ограничения учитывали и что заметили в процессе.",
      "Завершите конкретным выводом: что сработало, что вы изменили бы сейчас и что может быть полезно читателю с похожей задачей.",
    ].join("\n\n"),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ArticleAssistBody;
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 180) : "";
    const category = typeof body.category === "string" ? body.category.trim().slice(0, 60) : "Личный опыт";
    const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim().slice(0, 400) : "";
    const content = typeof body.content === "string" ? body.content.trim().slice(0, 6000) : "";

    if (!title && !content) {
      return NextResponse.json({ error: "Добавьте тему или несколько исходных мыслей для AI-редактора." }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
    if (!apiKey) return NextResponse.json(fallbackArticle(title, category, content));

    const baseUrl = (process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com").replace(/\/$/, "");
    const model = (process.env.DEEPSEEK_MODEL ?? "deepseek-chat").trim();
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: .5,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Ты внимательный редактор русскоязычного beauty-журнала. Сохраняй авторский голос, не придумывай медицинских обещаний и не превращай текст в рекламу. Верни только JSON с полями excerpt и content. excerpt — до 220 знаков. content — 3–6 содержательных абзацев без markdown-заголовков.",
          },
          {
            role: "user",
            content: JSON.stringify({ title, category, excerpt, content }),
          },
        ],
      }),
      signal: AbortSignal.timeout(24_000),
    });

    if (!response.ok) return NextResponse.json(fallbackArticle(title, category, content));
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return NextResponse.json(fallbackArticle(title, category, content));

    const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, "")) as { excerpt?: unknown; content?: unknown };
    return NextResponse.json({
      excerpt: typeof parsed.excerpt === "string" ? parsed.excerpt.trim().slice(0, 400) : excerpt,
      content: typeof parsed.content === "string" ? parsed.content.trim().slice(0, 8000) : content,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "AI-редактор временно недоступен. Черновик не потерян." }, { status: 500 });
  }
}
