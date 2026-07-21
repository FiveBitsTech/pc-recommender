# PC Recommender — Server

NestJS + Prisma + PostgreSQL.

## Setup

```bash
cd server
# crea la BD pc_recommender en Postgres
pnpm prisma migrate deploy   # o: pnpm prisma:migrate
pnpm db:seed
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

Copia `.env.example` → `.env.local` y ajusta `DATABASE_URL` antes de migrar.

## Módulos

`companies` · `products` · `tags` · `requirements` · `recommendations` · `comparisons` · `scraping`

Cada uno: `domain` → `application` → `infrastructure` → `presentation`.
