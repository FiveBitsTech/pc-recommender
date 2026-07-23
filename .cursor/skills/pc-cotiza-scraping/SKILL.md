---
name: pc-cotiza-scraping
description: >-
  Servicio de scraping/ingest PC-Cotiza: contrato JSON batch, adaptadores por
  tienda, fixtures, cron Nest, ScrapingHistory e ingest a Prisma. Usar al tocar
  modules/scraping, fixtures/scraping o jobs de actualización de catálogo.
---

# PC-Cotiza — scraping e ingest

## Enfoque

Híbrido: **fixtures/snapshots primero**, adaptadores live después. Demo no debe depender de HTML en vivo.

## Contrato batch

```json
{
  "run": { "source": "memory-kings", "scraped_at": "ISO", "adapter": "fixture-v1" },
  "company": { "slug": "memory-kings", "name": "...", "website": "..." },
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

- Upsert `Company` por `slug`.
- Upsert `Product` por `(companyId, productUrl)`.
- Upsert `ProductSpec` 1:1 (proyectar nested → strings).
- **Insert** `ProductPrice` cada run (historial; no update-in-place).
- Tags + relations (normalizar nombre).
- `ScrapingHistory`: status, productsFound, source, errorMessage.

## Capas Nest

`domain/ports` → adapters (`fixture`, `memory-kings`) → `IngestScrapedBatchUseCase` → `RunScrapingUseCase` → cron + `POST /api/scraping/run`.

## Librerías

- Live: **Playwright**
- Validación: class-validator / DTO
- Cron: `@nestjs/schedule`
- Env: `SCRAPE_MODE=fixture|live`, `SCRAPE_CRON`, `SCRAPE_SOURCES`

## Anti-patrones

- No scrapear en el controller.
- No sobrescribir el único precio (usar historial).
- No dejar que un proveedor altere scores.
- No mezclar lógica de recomendación aquí.
