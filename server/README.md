# PC COTIZA-IA — Server

NestJS 11 + Prisma + PostgreSQL + OpenAI GPT-4o-mini + Playwright.

## Setup

```bash
cd server
pnpm install
cp .env.example .env          # completar DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
pnpm prisma migrate deploy    # aplica migraciones
pnpm prisma:generate          # genera el cliente Prisma
pnpm db:seed                  # crea usuario admin
pnpm serve                    # inicia en modo watch
```

API: `http://localhost:5300/api`

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `5300` |
| `DATABASE_URL` | Conexión PostgreSQL | — |
| `CORS_ORIGIN` | URL del frontend | `http://localhost:3000` |
| `JWT_SECRET` | Secreto para firmar tokens | `change_me` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `ADMIN_EMAIL` | Email del admin (seed) | `admin@pc-cotiza.local` |
| `ADMIN_PASSWORD` | Password del admin (seed) | `Admin123!` |
| `OPENAI_API_KEY` | API key de OpenAI (recomendaciones, builder, comparador) | — |
| `SCRAPE_PRODUCT_LIMIT` | Max productos por empresa | `2000` |
| `SCRAPE_CATEGORY_PAGES` | Listados en rastreo heurístico | `12` |
| `SCRAPE_MAX_LISTINGS` | Tope de listados con categorías | `60` |
| `SCRAPE_CRON` | Expresión cron para scraping automático | `0 3 * * *` |
| `SCRAPE_CRON_ENABLED` | Activar cron de scraping | `false` |

## Auth

Seed crea un admin:
- Email: `admin@pc-cotiza.local`
- Password: `Admin123!` (o lo que definas en `ADMIN_PASSWORD`)

```bash
POST /api/auth/login
{ "email": "admin@pc-cotiza.local", "password": "Admin123!" }
# Respuesta: { accessToken: "..." }
# Usar header: Authorization: Bearer <accessToken>
```

## Endpoints principales

### Públicos
- `POST /api/auth/login` — login
- `GET /api/companies` — empresas activas
- `GET /api/products` — productos con precios

### Requieren auth (usuario)
- `POST /api/requirements` — crear requerimiento (inicia flujo de cotización)
- `GET /api/requirements` — mis requerimientos
- `GET /api/recommendations/:requirementId` — recomendaciones IA para un requerimiento
- `POST /api/comparisons/compare` — comparar 2-3 productos con IA
- `POST /api/builder/build` — generar configuración de PC con IA

### Requieren auth (admin)
- `POST /api/companies` — crear/editar empresa + scrapeConfig
- `POST /api/scraping/run` — ejecutar scraping (`{ companyId, dryRun? }`)
- `GET /api/scraping/progress?companyId=` — progreso en tiempo real
- `GET /api/scraping/history` — historial de scraping

## Flujos con IA (OpenAI GPT-4o-mini)

1. **Recomendaciones** — Dado un requerimiento (uso, presupuesto, prioridad, tipo de equipo), busca productos en BD y pide a la IA que seleccione los 3 mejores con score, ventajas, desventajas y evaluación de precio.

2. **Armador de PCs** — Dado uso y presupuesto, busca componentes reales en BD y pide a la IA una configuración completa con validación de compatibilidad, consumo eléctrico y upgrades futuros.

3. **Comparador** — Dados 2-3 productos, la IA analiza cuál es mejor según cada caso de uso, compara specs y puntúa por categoría.

4. **scrapeConfig IA** — Al agregar una empresa nueva, la IA analiza la estructura del sitio web y genera el JSON de configuración para el scraper.

## Scraping

Flujo: crear empresa (website + scrapeConfig) → `POST /api/scraping/run` con `companyId` → Playwright recorre categorías → extrae productos → persiste en BD.

El `scrapeConfig` de la empresa dirige el run:
- `categories[]` — URLs semilla para el rastreo
- `listing.productLinkSelector` — selector CSS para encontrar links de producto
- `pagination` — tipo (`query`/`link`) + selector o param para paginar
- `product.*` — selectores de nombre, precio, imagen, specs en la ficha

Sin categorías usables, cae al rastreo heurístico desde `baseUrl`.

## Módulos

| Módulo | Descripción |
|--------|-------------|
| `auth` | Login JWT, guards, estrategia Passport |
| `companies` | CRUD de empresas + scrapeConfig |
| `products` | Catálogo de productos con precios |
| `tags` | Tags de productos |
| `requirements` | Requerimientos del usuario (uso, presupuesto, prioridad) |
| `recommendations` | Recomendaciones IA basadas en requerimientos |
| `comparisons` | Comparador de productos con IA |
| `builder` | Armador de PCs con IA |
| `scraping` | Scraping con Playwright + ingest + cron |

Cada módulo: `domain/` → `application/` → `infrastructure/` → `presentation/`.

## Scripts

```bash
pnpm serve           # dev con watch
pnpm build           # compilar
pnpm start:prod      # producción
pnpm prisma:migrate  # nueva migración
pnpm prisma:studio   # UI de Prisma
pnpm db:seed         # seed admin
```
