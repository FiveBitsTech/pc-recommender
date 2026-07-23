import { Injectable, Logger } from '@nestjs/common'
import type { ScrapedBatch, ScrapedCompany, ScrapedProductItem } from '../../domain/ports/store-scraper.port'

const PRODUCT_HREF_HINTS = [
  'producto',
  'product',
  'products',
  '/p/',
  'item',
  'laptop',
  'computadora',
  'pc-',
  'notebook',
]

@Injectable()
export class PlaywrightStoreProbe {
  private readonly logger = new Logger(PlaywrightStoreProbe.name)

  async probe(input: {
    source: string
    adapter: string
    company: ScrapedCompany
    baseUrl: string
    limit?: number
  }): Promise<ScrapedBatch> {
    const limit = input.limit ?? 5
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ headless: true })

    try {
      const page = await browser.newPage()
      await page.goto(input.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })

      const hrefs = await page.$$eval('a[href]', (anchors) =>
        anchors.map((a) => (a as HTMLAnchorElement).href).filter(Boolean),
      )

      const baseHost = new URL(input.baseUrl).host.replace(/^www\./, '')
      const productUrls = [...new Set(hrefs)]
        .filter((href) => {
          try {
            const u = new URL(href)
            const host = u.host.replace(/^www\./, '')
            if (host !== baseHost) return false
            const path = `${u.pathname}${u.search}`.toLowerCase()
            return PRODUCT_HREF_HINTS.some((hint) => path.includes(hint))
          } catch {
            return false
          }
        })
        .slice(0, limit)

      this.logger.log(
        `Probe ${input.source}: found ${productUrls.length} candidate product URLs (limit=${limit})`,
      )

      const products: ScrapedProductItem[] = []

      for (const url of productUrls) {
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
          const extracted = await page.evaluate(() => {
            const title =
              document.querySelector('h1')?.textContent?.trim() ||
              document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
              document.title
            const image =
              document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
              document.querySelector('img')?.getAttribute('src') ||
              null
            const bodyText = document.body?.innerText?.slice(0, 8000) || ''
            const priceMatch =
              bodyText.match(/(?:S\/\.?|PEN)\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)/i) ||
              bodyText.match(/([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)\s*(?:soles|pen)/i)
            return { title, image, priceRaw: priceMatch?.[1] ?? null, bodySnippet: bodyText.slice(0, 400) }
          })

          const price = this.parsePrice(extracted.priceRaw)
          products.push({
            product: {
              name: extracted.title || 'Producto sin título',
              brand: null,
              model: null,
              category: null,
              productUrl: url,
              imageUrl: extracted.image,
              externalSku: null,
            },
            price: {
              price,
              currency: 'PEN',
              available: price > 0,
              stockQty: null,
              updatedAt: new Date().toISOString(),
            },
            specs: {},
            tags: [],
            confidence: price > 0 ? 0.4 : 0.2,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          this.logger.warn(`Probe skip url=${url}: ${message}`)
        }
      }

      return {
        run: {
          source: input.source,
          scrapedAt: new Date().toISOString(),
          adapter: input.adapter,
        },
        company: input.company,
        products,
      }
    } finally {
      await browser.close()
    }
  }

  private parsePrice(raw: string | null): number {
    if (!raw) return 0
    const normalized = raw.replace(/\./g, '').replace(',', '.')
    const value = Number(normalized)
    return Number.isFinite(value) ? value : 0
  }
}
