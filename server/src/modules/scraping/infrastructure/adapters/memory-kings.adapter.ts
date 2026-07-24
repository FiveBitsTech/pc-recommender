import { Injectable } from '@nestjs/common'
import type { ScrapedBatch, StoreScraper } from '../../domain/ports/store-scraper.port'
import { PlaywrightStoreProbe } from './playwright-store-probe'

/**
 * Live via probe genérico (misma estrategia que CYC / Impacto / Deltron).
 * Opcional: MEMORY_KINGS_BASE_URL para forzar listing de entrada.
 */
@Injectable()
export class MemoryKingsStoreScraper implements StoreScraper {
  readonly source = 'memory-kings'

  constructor(private readonly probe: PlaywrightStoreProbe) {}

  scrape(): Promise<ScrapedBatch> {
    return this.probe.probe({
      source: this.source,
      adapter: 'memory-kings-live-v1',
      company: {
        slug: 'memory-kings',
        name: 'Memory Kings',
        website: 'https://memorykings.pe/',
      },
      baseUrl: process.env.MEMORY_KINGS_BASE_URL ?? 'https://memorykings.pe/',
      limit: Number(process.env.SCRAPE_PRODUCT_LIMIT ?? process.env.SCRAPE_PREVIEW_LIMIT ?? 100),
    })
  }
}
