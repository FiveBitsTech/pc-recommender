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
  'componente',
  'periferico',
]

const LISTING_HREF_HINTS = [
  'categoria',
  'category',
  'categories',
  'catalogo',
  'catalogue',
  'tienda',
  'shop',
  'collection',
  'laptop',
  'computadora',
  'notebook',
  'componente',
  'periferico',
  'producto',
  'products',
]

const productLimitFromEnv = () => Number(process.env.SCRAPE_PRODUCT_LIMIT ?? 2000)

const categoryPagesFromEnv = () => Number(process.env.SCRAPE_CATEGORY_PAGES ?? 12)

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
    const limit = input.limit ?? productLimitFromEnv()
    const maxCategoryPages = categoryPagesFromEnv()
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ headless: true })

    try {
      const page = await browser.newPage()
      const baseHost = new URL(input.baseUrl).host.replace(/^www\./, '')
      const productUrlSet = new Set<string>()
      const listingQueue: string[] = [input.baseUrl]
      const visitedListings = new Set<string>()

      while (listingQueue.length > 0 && productUrlSet.size < limit && visitedListings.size < maxCategoryPages) {
        const listingUrl = listingQueue.shift()
        if (!listingUrl || visitedListings.has(listingUrl)) continue
        visitedListings.add(listingUrl)

        try {
          await page.goto(listingUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
          // Algunas tiendas cargan grid por scroll / lazy
          await page.evaluate(async () => {
            for (let i = 0; i < 4; i += 1) {
              window.scrollBy(0, window.innerHeight)
              await new Promise(r => setTimeout(r, 350))
            }
          }).catch(() => undefined)

          const hrefs = await page.$$eval('a[href]', anchors =>
            anchors.map(a => (a as HTMLAnchorElement).href).filter(Boolean),
          )

          for (const href of hrefs) {
            try {
              const u = new URL(href)
              const host = u.host.replace(/^www\./, '')
              if (host !== baseHost) continue
              const path = `${u.pathname}${u.search}`.toLowerCase()
              const clean = `${u.origin}${u.pathname}`.replace(/\/$/, '')

              if (PRODUCT_HREF_HINTS.some(hint => path.includes(hint))) {
                productUrlSet.add(clean)
              } else if (
                LISTING_HREF_HINTS.some(hint => path.includes(hint)) &&
                listingQueue.length + visitedListings.size < maxCategoryPages * 2
              ) {
                if (!visitedListings.has(clean) && !listingQueue.includes(clean)) {
                  listingQueue.push(clean)
                }
              }
            } catch {
              // ignore bad URLs
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          this.logger.warn(`Probe listing skip url=${listingUrl}: ${message}`)
        }
      }

      const productUrls = [...productUrlSet].slice(0, limit)

      this.logger.log(
        `Probe ${input.source}: listings=${visitedListings.size} products=${productUrls.length} (limit=${limit})`,
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
            return { title, image, priceRaw: priceMatch?.[1] ?? null }
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
            confidence: price > 0 ? 0.45 : 0.25,
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
