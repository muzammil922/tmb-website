# TMB Public Website

Next.js movie platform for browsing, search, and streaming.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Vercel deploy

1. Import repo `muzammil922/tmb-website`
2. Framework: Next.js (auto-detected)
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   ```
4. Deploy

Replace `api.yourdomain.com` with your Dokploy backend URL.
