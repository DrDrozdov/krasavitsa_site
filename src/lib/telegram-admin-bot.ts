import { getAnalyticsSnapshot } from "@/lib/analytics-store";

type TelegramChat = {
  id?: number;
};

type TelegramUser = {
  id?: number;
  is_bot?: boolean;
  first_name?: string;
  username?: string;
};

type TelegramMessage = {
  message_id?: number;
  from?: TelegramUser;
  chat?: TelegramChat;
  text?: string;
};

export type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
};

type TelegramReplyMarkup = {
  keyboard: Array<Array<{ text: string }>>;
  resize_keyboard: boolean;
};

type SendMessagePayload = {
  chat_id: number;
  text: string;
  parse_mode?: "HTML";
  reply_markup?: TelegramReplyMarkup;
};

const adminMenu: TelegramReplyMarkup = {
  resize_keyboard: true,
  keyboard: [
    [{ text: "Сегодня" }, { text: "Неделя" }],
    [{ text: "Сайт" }, { text: "Бот" }],
    [{ text: "Реклама" }, { text: "Обращения" }],
    [{ text: "Экспорт" }, { text: "Статус" }],
  ],
};

export function getAdminIds() {
  return new Set(
    (process.env.TELEGRAM_ADMIN_IDS ?? "")
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isSafeInteger(value) && value > 0),
  );
}

export function isTelegramAdmin(userId: number | undefined) {
  if (!userId) {
    return false;
  }

  return getAdminIds().has(userId);
}

export function normalizeBotCommand(text: string | undefined) {
  return (text ?? "").trim().toLowerCase();
}

export async function buildAdminReply(command: string) {
  const analytics = await getAnalyticsSnapshot(command === "/today" || command === "сегодня" ? 1 : 7);
  switch (command) {
    case "/start":
    case "меню":
      return [
        "Админ-бот «Красавица» готов.",
        "",
        "Доступные разделы: сегодня, неделя, сайт, бот, реклама, обращения, экспорт, статус.",
      ].join("\n");

    case "/today":
    case "сегодня":
      return [
        "Красавица: сводка за сегодня",
        "",
        `Просмотры: ${analytics.totals.pageviews}`,
        `Ключевые действия: ${analytics.totals.cta}`,
        `Переходы в Telegram: ${analytics.totals.telegram}`,
        `Поиски: ${analytics.totals.searches}`,
        `Успешность подборов: ${Math.round(analytics.rates.searchSuccess * 100)}%`,
        `Среднее время AI: ${analytics.averages.searchMs ? (analytics.averages.searchMs / 1000).toFixed(1) : "—"} с`,
        `Избранное: ${analytics.totals.favoriteSaves} · Статьи: ${analytics.totals.articleSaves}`,
        `Ошибки: ${analytics.totals.errors}`,
      ].join("\n");

    case "/week":
    case "неделя":
      return [
        "Красавица: сводка за неделю",
        "",
        `Просмотры: ${analytics.totals.pageviews}`,
        `Ключевые действия: ${analytics.totals.cta}`,
        `Переходы в Telegram: ${analytics.totals.telegram}`,
        `Поиски: ${analytics.totals.searches}`,
        `Успешность подборов: ${Math.round(analytics.rates.searchSuccess * 100)}%`,
        `Среднее время AI: ${analytics.averages.searchMs ? (analytics.averages.searchMs / 1000).toFixed(1) : "—"} с`,
        `Избранное: ${analytics.totals.favoriteSaves} · Статьи: ${analytics.totals.articleSaves}`,
        `Ошибки: ${analytics.totals.errors}`,
      ].join("\n");

    case "/site":
    case "сайт":
      return `Сайт за 7 дней: ${analytics.totals.pageviews} просмотров, ${analytics.totals.cta} ключевых действий, ${analytics.totals.telegram} переходов в Telegram.`;

    case "/bot":
    case "бот":
      return "Telegram-бот: модуль готов к подключению событий меню, кнопок и сценариев.";

    case "/ads":
    case "реклама":
      return "Реклама: модуль готов к кампаниям, UTM, бюджетам и erid.";

    case "/leads":
    case "обращения":
      return "Обращения: в статистику должны попадать только агрегаты без телефонов, имен и Telegram ID клиентов.";

    case "/export":
    case "экспорт":
      return "Экспорт: будет доступен после подключения базы и генерации XLSX/CSV/PDF.";

    case "/health":
    case "статус":
      return [
        "Статус системы",
        "",
        "Webhook: работает",
        "Проверка админ-доступа: работает",
        "Токен бота: настроен",
        "База аналитики: еще не подключена",
      ].join("\n");

    default:
      return "Команда не распознана. Используйте кнопки меню или команды /today, /week, /site, /bot, /ads, /leads, /export, /health.";
  }
}

export async function sendTelegramMessage(payload: SendMessagePayload) {
  const token = process.env.TELEGRAM_ADMIN_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_ADMIN_BOT_TOKEN is not configured");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Telegram sendMessage failed");
  }
}

export async function buildMessagePayload(update: TelegramUpdate): Promise<SendMessagePayload | null> {
  const message = update.message;
  const chatId = message?.chat?.id;
  const userId = message?.from?.id;

  if (!chatId || !isTelegramAdmin(userId)) {
    return null;
  }

  return {
    chat_id: chatId,
    text: await buildAdminReply(normalizeBotCommand(message?.text)),
    reply_markup: adminMenu,
  };
}

export async function sendDailyAnalyticsDigest() {
  const recipients = [...getAdminIds()];
  if (!recipients.length) throw new Error("TELEGRAM_ADMIN_IDS is not configured");
  const analytics = await getAnalyticsSnapshot(1);
  const text = [
    "Красавица: ежедневная сводка",
    "",
    `Просмотры: ${analytics.totals.pageviews}`,
    `Ключевые действия: ${analytics.totals.cta}`,
    `Переходы в Telegram: ${analytics.totals.telegram}`,
    `Поиски: ${analytics.totals.searches}`,
    `Готовые подборы: ${analytics.totals.searchSuccess}`,
    `Успешность подборов: ${Math.round(analytics.rates.searchSuccess * 100)}%`,
    `Среднее время ответа AI: ${analytics.averages.searchMs ? (analytics.averages.searchMs / 1000).toFixed(1) : "—"} с`,
    `Показано средств: ${analytics.totals.productsShown}`,
    `Запросы на уточнение: ${analytics.totals.searchRejected}`,
    `Избранное: ${analytics.totals.favoriteSaves}`,
    `Статьи: ${analytics.totals.articleSaves}`,
    `Действия профиля: ${analytics.totals.profiles}`,
    `Ошибки: ${analytics.totals.errors}`,
    "",
    "Данные агрегированы: без IP, текста запросов и постоянных идентификаторов.",
  ].join("\n");
  const delivery = await Promise.allSettled(recipients.map((chat_id) => sendTelegramMessage({ chat_id, text })));
  return { recipients: recipients.length, delivered: delivery.filter((result) => result.status === "fulfilled").length };
}
