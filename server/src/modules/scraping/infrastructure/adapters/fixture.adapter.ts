import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Injectable } from '@nestjs/common'
import type { ScrapedBatch, StoreScraper } from '../../domain/ports/store-scraper.port'

type RawBatch = {
  run?: { source?: string; scraped_at?: string; scrapedAt?: string; adapter?: string }
  company: {
    slug: string
    name: string
    website?: string
    logo_url?: string
    logoUrl?: string
  }
  products: Array<{
    product: {
      name: string
      brand?: string
      model?: string
      category?: string
      product_url?: string
      productUrl?: string
      image_url?: string
      imageUrl?: string
      external_sku?: string
      externalSku?: string
    }
    price: {
      price: number
      currency?: string
      available?: boolean
      stock_qty?: number | null
      stockQty?: number | null
      updated_at?: string
      updatedAt?: string
    }
    specs?: ScrapedBatch['products'][number]['specs']
    tags?: string[]
    confidence?: number
  }>
}

@Injectable()
export class FixtureStoreScraper implements StoreScraper {
  readonly source = 'fixture'

  async scrape(): Promise<ScrapedBatch> {
    const filePath = join(process.cwd(), 'fixtures', 'scraping', 'memory-kings.sample.json')
    const raw = await readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as RawBatch

    return {
      run: {
        source: parsed.run?.source ?? 'memory-kings',
        scrapedAt: parsed.run?.scraped_at ?? parsed.run?.scrapedAt ?? new Date().toISOString(),
        adapter: parsed.run?.adapter ?? 'fixture-v1',
      },
      company: {
        slug: parsed.company.slug,
        name: parsed.company.name,
        website: parsed.company.website ?? null,
        logoUrl: parsed.company.logo_url ?? parsed.company.logoUrl ?? null,
      },
      products: (parsed.products ?? []).map((item) => ({
        product: {
          name: item.product.name,
          brand: item.product.brand ?? null,
          model: item.product.model ?? null,
          category: item.product.category ?? null,
          productUrl: item.product.product_url ?? item.product.productUrl!,
          imageUrl: item.product.image_url ?? item.product.imageUrl ?? null,
          externalSku: item.product.external_sku ?? item.product.externalSku ?? null,
        },
        price: {
          price: Number(item.price.price),
          currency: item.price.currency ?? 'PEN',
          available: item.price.available ?? true,
          stockQty: item.price.stock_qty ?? item.price.stockQty ?? null,
          updatedAt:
            item.price.updated_at ?? item.price.updatedAt ?? new Date().toISOString(),
        },
        specs: item.specs,
        tags: item.tags ?? [],
        confidence: item.confidence,
      })),
    }
  }
}
