# Красавица Beauty OS

Premium landing page and AI skincare recommendation interface built with Next.js, TypeScript, Tailwind CSS, and Motion.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run lint
npm run build
npm run start
```

## Dokploy Deployment

Use a Dokploy **Application** connected to this GitHub repository.

Recommended settings:

- Build Type: `Dockerfile`
- Dockerfile Path: `./Dockerfile`
- Docker Context Path: `.`
- Port: `3000`

Environment variables to set in Dokploy:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.ru
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

The website route `/api/recommendations` is the canonical recommendation engine
for the website and Telegram bot. In the bot project set:

```bash
BEAUTY_OS_API_URL=https://your-domain.ru/api/recommendations
```

The engine returns only product links that pass direct-page validation. Search
pages are intentionally not returned. To trust additional official brand or
retailer domains, add them to `PRODUCT_LINK_ALLOWED_HOSTS`.

See `BEAUTY_SEARCH_METHODOLOGY.md` for the quality and safety contract.

## Secrets

Do not commit `.env.local` or any real API keys. Environment files are ignored by git.
