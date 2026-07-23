import { Injectable } from '@nestjs/common'
import { StoreScraperRegistry } from '../../infrastructure/adapters/store-scraper.registry'

@Injectable()
export class PreviewScrapingUseCase {
  constructor(private readonly registry: StoreScraperRegistry) {}

  async execute(source: string, limit?: number) {
    const scraper = this.registry.resolve(source)
    const batch = await scraper.scrape()

    const products =
      typeof limit === 'number' && limit > 0 ? batch.products.slice(0, limit) : batch.products

    return {
      dryRun: true,
      persisted: false,
      source: batch.run.source,
      adapter: batch.run.adapter,
      scrapedAt: batch.run.scrapedAt,
      company: batch.company,
      productsFound: products.length,
      products,
      note: 'Preview only — nothing was saved to the database. Use POST /api/scraping/run to persist.',
    }
  }
}
