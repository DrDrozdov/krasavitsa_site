# Ежедневная сводка в Telegram

В `docker-compose.yml` добавлен отдельный сервис `analytics-digest-scheduler`. Он автоматически обращается к приложению по внутренней Docker-сети и отправляет агрегированную сводку всем ID из `TELEGRAM_ADMIN_IDS`.

Настройки в Dokploy:

```env
TELEGRAM_ADMIN_BOT_TOKEN=токен_бота
TELEGRAM_ADMIN_BOT_SECRET=случайная_строка_не_короче_32_символов
TELEGRAM_ADMIN_IDS=123456789
ANALYTICS_TIME_ZONE=Europe/Moscow
ANALYTICS_DIGEST_TIME=21:05
ANALYTICS_DATA_DIR=/app/data
```

По умолчанию отчёт отправляется ежедневно в 21:05 по Москве. Внешний cron в Dokploy создавать не требуется. Должен работать ровно один экземпляр `analytics-digest-scheduler`, иначе отчёт будет продублирован.

Планировщик делает внутренний `POST /api/telegram/admin/digest` и передаёт секрет через заголовок `Authorization`. Секрет не находится в URL, истории браузера или стандартном access log.

В отчёт входят просмотры, действия, переходы в Telegram, все запуски поиска, готовые подборы, запросы на уточнение и ошибки. Тексты запросов, IP-адреса и постоянные идентификаторы посетителей не сохраняются.
