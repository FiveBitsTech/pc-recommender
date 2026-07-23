import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ScrapedBatch, StoreScraper } from '../../domain/ports/store-scraper.port'

/**
 * Skeleton live adapter. Fill MEMORY_KINGS_LISTING_URL + MEMORY_KINGS_PRODUCT_URLS
 * when ready to scrape. Until then scrape() throws a clear error.
 */
@Injectable()
export class MemoryKingsStoreScraper implements StoreScraper {
  readonly source = 'memory-kings'
  private readonly logger = new Logger(MemoryKingsStoreScraper.name)

  constructor(private readonly config: ConfigService) {}

  async scrape(): Promise<ScrapedBatch> {
    const listingUrl = this.config.get<string>('MEMORY_KINGS_LISTING_URL')
    const productUrls = (this.config.get<string>('MEMORY_KINGS_PRODUCT_URLS') ?? '')
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean)

    if (!listingUrl && productUrls.length === 0) {
      throw new Error(
        'MemoryKingsStoreScraper: configure MEMORY_KINGS_LISTING_URL and/or MEMORY_KINGS_PRODUCT_URLS',
      )
    }

    this.logger.warn(
      'MemoryKings live scrape is scaffolded. Install selectors after URLs are provided. Falling back not implemented.',
    )

    // Playwright entrypoint reserved for phase 3 (URLs from team).
    // Dynamic import keeps cold start light when mode=fixture.
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ headless: true })

    try {
      const page = await browser.newPage()
      const products: ScrapedBatch['products'] = []

      const urls = productUrls.length
        ? productUrls
        : listingUrl
          ? [listingUrl]
          : []

      for (const url of urls) {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
        // TODO: map real DOM selectors once URLs are confirmed by the team.
        const title = await page.title()
        products.push({
          product: {
            name: title || 'Memory Kings product (pending selectors)',
            brand: null,
            model: null,
            category: 'Laptop',
            productUrl: url,
            imageUrl: null,
            externalSku: null,
          },
          price: {
            price: 0,
            currency: 'PEN',
            available: false,
            stockQty: null,
            updatedAt: new Date().toISOString(),
          },
          specs: {},
          tags: [],
          confidence: 0.1,
        })
      }

      return {
        run: {
          source: this.source,
          scrapedAt: new Date().toISOString(),
          adapter: 'memory-kings-v1-skeleton',
        },
        company: {
          slug: 'memory-kings',
          name: 'Memory Kings',
          website: 'https://memorykings.pe/',
        },
        products,
      }
    } finally {
      await browser.close()
    }
  }
}
