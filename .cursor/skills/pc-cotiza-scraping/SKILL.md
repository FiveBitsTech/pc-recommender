---
name: pc-cotiza-scraping
description: >-
  Servicio de scraping/ingest PC-Cotiza: empresas (website + scrapeConfig),
  probe Playwright, cron Nest, ScrapingHistory e ingest a Prisma. Usar al tocar
  modules/scraping o jobs de actualización de catálogo.
---

# PC-Cotiza — scraping e ingest

## Enfoque

Flujo principal: **empresa en UI** (website + scrapeConfig IA) → `POST /api/scraping/run` con `companyId` → `PlaywrightStoreProbe` → ingest → `ScrapingHistory`.

No hay adapters dedicados por tienda ni modo fixture/live en env.

## Contrato batch

```json
{
  "run": { "source": "slug-empresa", "scraped_at": "ISO", "adapter": "company-scrape-config-v1" },
  "company": { "slug": "...", "name": "...", "website": "..." },
  "products": [
    {
      "product": { "name", "brand", "model", "category", "product_url", "image_url", "external_sku?" },
      "price": { "price", "currency", "available", "stock_qty?", "updated_at" },
      "specs": { "nested or flat" },
      "tags": ["..."],
      "confidence?"
    }
  ]
}
```

## Persistencia

- **Ingest incremental**: `Company` se upserta antes del crawl y cada ficha se guarda apenas se scrapea (`onProduct` del probe). Si el run falla a mitad, lo ya guardado queda en BD.
- Upsert `Company` por `slug`.
- Upsert `Product` por `(companyId, productUrl)`.
- Upsert `ProductSpec` 1:1 (proyectar nested → strings).
- **Insert** `ProductPrice` cada run (historial; no update-in-place).
- Tags + relations (normalizar nombre).
- `ScrapingHistory`: status, productsFound, source, errorMessage.

## Capas Nest

`PlaywrightStoreProbe` → `IngestScrapedBatchUseCase` → `RunScrapingUseCase` → cron (todas las empresas activas) + `POST /api/scraping/run` (`companyId` obligatorio).

Progreso: `ScrapingProgressService` (en memoria) expone `GET /api/scraping/progress?companyId=` con `visited/total/persisted/etaSeconds`; el cliente lo pollea cada 1.5s.

Yield: si `productsFound` cae >50% vs última corrida `success` del mismo `source`, el run responde `yieldWarning`.

## scrapeConfig dirige el run

`categories[]` siembra el rastreo y aporta la categoría de cada producto · `listing.productLinkSelector` localiza fichas ·
`pagination` (`query` / `link`) recorre páginas · `product.*` prioriza selectores de la ficha. Sin categorías usables, cae
al rastreo heurístico desde `baseUrl`.

Campos derivados en la ficha (`parse-product-fields.ts`): categoría, marca, modelo, SKU, specs, tags y precio.
Orden de precio: JSON-LD → meta → `itemprop` → selector del config → `data-*` → clases `price` → texto.

## Env

- `SCRAPE_PRODUCT_LIMIT` (default 2000)
- `SCRAPE_CATEGORY_PAGES` (default 12, rastreo heurístico)
- `SCRAPE_MAX_LISTINGS` (default 60, tope con categorías del config)
- `SCRAPE_REQUEST_DELAY_MS`
- `SCRAPE_CRON` / `SCRAPE_CRON_ENABLED`

## Anti-patrones

- No scrapear en el controller.
- No sobrescribir el único precio (usar historial).
- No hardcodear tiendas en `.env`.
- No mezclar lógica de recomendación aquí.
