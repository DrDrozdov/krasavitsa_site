# Ежедневная сводка в Telegram

После деплоя создайте в Dokploy расписание для Compose-проекта `krasavitsa-compose`.

- Тип: HTTP request / curl.
- Время: `05 21 * * *` (каждый день в 21:05 по времени сервера).
- URL: `https://ваш-домен.ru/api/telegram/admin/digest/ФАКТИЧЕСКОЕ_ЗНАЧЕНИЕ_TELEGRAM_ADMIN_BOT_SECRET`.
- Метод: `GET`.

Маршрут отправит агрегированную дневную сводку всем ID из `TELEGRAM_ADMIN_IDS`. URL нельзя публиковать: в нём содержится секрет.
