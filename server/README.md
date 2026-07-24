# PC Recommender — Server

NestJS + Prisma + PostgreSQL.

## Setup

```bash
cd server
# crea la BD pc_recommender en Postgres
pnpm install
pnpm prisma migrate deploy   # o: pnpm prisma:migrate
pnpm prisma:generate
pnpm db:seed
pnpm serve
```

API: `http://localhost:5300/api`

## Auth (admin mínimo)

Seed:
- email: `admin@pc-cotiza.local`
- password: `Admin123!`

```bash
# login
POST /api/auth/login
{ "email": "admin@pc-cotiza.local", "password": "Admin123!" }

# usar header: Authorization: Bearer <accessToken>
```

Admin:
- `POST /api/companies` — upsert empresa + scrapeConfig
- `PATCH /api/companies/:id`
- `GET /api/companies/admin/all`
- scraping `preview` / `run` / `history` / `sources`

Público:
- `GET /api/companies` (activas)
- `GET /api/products`

## Scraping

Flujo: crear empresa (website + scrapeConfig) → ejecutar desde UI o API.

`POST` `http://localhost:5300/api/scraping/run`

```json
{ "companyId": 1 }
```

Dry-run:

```json
{ "companyId": 1, "dryRun": true }
```

Env: `SCRAPE_PRODUCT_LIMIT`, `SCRAPE_REQUEST_DELAY_MS`, `SCRAPE_CRON`, `SCRAPE_CRON_ENABLED`.

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

## Skills Cursor

- `.cursor/skills/pc-cotiza-context`
- `.cursor/skills/pc-cotiza-scraping`
- `.cursor/rules/pc-cotiza.mdc`
