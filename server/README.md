# PC Recommender — Server

NestJS + Prisma + PostgreSQL (mismo patrón de carpetas que `pasalasfijas-server`).

## Setup

```bash
pnpm install
cp .env.example .env.local
# Ajusta DATABASE_URL en .env.local
pnpm prisma migrate deploy
pnpm prisma:generate
pnpm serve
```

API: `http://localhost:5300/api`

## Env

| Archivo | Uso |
|---|---|
| `.env.example` | Plantilla |
| `.env.development` | Desarrollo |
| `.env.production` | Producción |
| `.env.local` | Overrides locales (no se sube a git) |

## Módulos

`companies` · `products` · `tags` · `requirements` · `recommendations` · `comparisons` · `scraping`

Cada uno: `domain` → `application` → `infrastructure` → `presentation`.
