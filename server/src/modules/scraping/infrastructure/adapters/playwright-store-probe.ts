import { Injectable, Logger } from '@nestjs/common'
import type { Page } from 'playwright'
import type {
  ScrapedBatch,
  ScrapedCompany,
  ScrapedProductItem,
  ScrapedSpecs,
} from '../../domain/ports/store-scraper.port'
import {
  buildTags,
  clamp,
  detectBrand,
  detectCategory,
  detectModel,
  detectPrice,
  detectSku,
  extractSpecs,
  type ProductSignals,
} from './parse-product-fields'
import { normalizeScrapeConfig, type StoreScrapeConfig } from './scrape-config'

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

const maxListingsFromEnv = () => Number(process.env.SCRAPE_MAX_LISTINGS ?? 60)

const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return ''
  }
}

type ProductOrigin = { listingUrl: string; categoryName: string | null }

type ListingTask = { url: string; categoryName: string | null; pageParam: number; depth: number }

type CrawlOptions = {
  seeds: ListingTask[]
  baseHost: string
  limit: number
  maxListings: number
  pagesPerCategory: number
  productLinkSelector: string | null
  waitMs: number
  pagination: StoreScrapeConfig['pagination']
  discoverListings: boolean
  onProgress?: (message: string, found: number) => void
}

@Injectable()
export class PlaywrightStoreProbe {
  private readonly logger = new Logger(PlaywrightStoreProbe.name)

  async probe(input: {
    source: string
    adapter: string
    company: ScrapedCompany
    baseUrl: string
    limit?: number
    scrapeConfig?: unknown
    onProgress?: (event: {
      phase: 'listing' | 'products'
      visited?: number
      total?: number
      message?: string
    }) => void
    onProduct?: (item: ScrapedProductItem) => Promise<void> | void
  }): Promise<ScrapedBatch> {
    const limit = input.limit ?? productLimitFromEnv()
    const config = normalizeScrapeConfig(input.scrapeConfig, input.baseUrl)
    const baseUrl = config.baseUrl ?? input.baseUrl
    const baseHost = hostOf(baseUrl)
    const report = input.onProgress
    const { chromium } = await import('playwright')
    const browser = await chromium.launch({ headless: true })

    try {
      const page = await browser.newPage()
      report?.({ phase: 'listing', message: 'Explorando listados…' })
      const seeds: ListingTask[] = config.categories
        .filter(category => hostOf(category.url) === baseHost)
        .map(category => ({
          url: category.url,
          categoryName: category.name,
          pageParam: config.pagination.start,
          depth: 1,
        }))

      let origins = new Map<string, ProductOrigin>()

      if (seeds.length > 0) {
        origins = await this.crawlListings(page, {
          seeds,
          baseHost,
          limit,
          maxListings: Math.min(maxListingsFromEnv(), seeds.length * config.listing.maxPages),
          pagesPerCategory: config.listing.maxPages,
          productLinkSelector: config.listing.productLinkSelector,
          waitMs: config.listing.waitMs,
          pagination: config.pagination,
          discoverListings: false,
          onProgress: (message, found) => report?.({ phase: 'listing', message: `${message} · ${found} URLs` }),
        })
        this.logger.log(
          `Probe ${input.source}: config categories=${seeds.length} pagesPerCategory=${config.listing.maxPages} found=${origins.size}`,
        )
      }

      // Sin categorías útiles en el JSON (o todas fallaron) volvemos al rastreo heurístico.
      if (origins.size === 0) {
        origins = await this.crawlListings(page, {
          seeds: [{ url: baseUrl, categoryName: null, pageParam: config.pagination.start, depth: 1 }],
          baseHost,
          limit,
          maxListings: categoryPagesFromEnv(),
          pagesPerCategory: 1,
          productLinkSelector: config.listing.productLinkSelector,
          waitMs: config.listing.waitMs,
          pagination: { ...config.pagination, type: 'unknown' },
          discoverListings: true,
          onProgress: (message, found) => report?.({ phase: 'listing', message: `${message} · ${found} URLs` }),
        })
        this.logger.log(`Probe ${input.source}: heuristic crawl found=${origins.size}`)
      }

      const productUrls = [...origins.keys()].slice(0, limit)
      this.logger.log(`Probe ${input.source}: products=${productUrls.length} (limit=${limit})`)
      report?.({ phase: 'products', visited: 0, total: productUrls.length })

      const products: ScrapedProductItem[] = []

      for (let index = 0; index < productUrls.length; index += 1) {
        const url = productUrls[index]
        const origin = origins.get(url)
        let item: ScrapedProductItem | null = null

        try {
          item = await this.scrapeProduct(page, url, origin ?? null, config)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          this.logger.warn(`Probe skip url=${url}: ${message}`)
        }

        if (item) {
          products.push(item)
          if (input.onProduct) {
            try {
              await input.onProduct(item)
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error)
              this.logger.warn(`Probe ingest failed url=${url}: ${message}`)
            }
          }
        }

        report?.({ phase: 'products', visited: index + 1, total: productUrls.length })
        // Cede el event loop para que GET /progress responda mientras corre el scrape.
        await new Promise<void>(resolve => setImmediate(resolve))
      }

      const priced = products.filter(item => item.price.price > 0).length
      const categorized = products.filter(item => item.product.category).length
      const branded = products.filter(item => item.product.brand).length
      this.logger.log(
        `Probe ${input.source}: priced=${priced}/${products.length} categorized=${categorized} branded=${branded}`,
      )

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

  private async crawlListings(page: Page, options: CrawlOptions): Promise<Map<string, ProductOrigin>> {
    const origins = new Map<string, ProductOrigin>()
    const queue = [...options.seeds]
    const visited = new Set<string>()

    while (queue.length > 0 && origins.size < options.limit && visited.size < options.maxListings) {
      const task = queue.shift()
      if (!task || visited.has(task.url)) continue
      visited.add(task.url)

      options.onProgress?.(
        `Listado ${visited.size}/${options.maxListings}`,
        origins.size,
      )

      try {
        await page.goto(task.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
        await this.settle(page, options.waitMs)

        const { selected, all } = await this.collectHrefs(page, options.productLinkSelector)
        const before = origins.size

        const fromSelector = this.cleanUrls(selected, options.baseHost)
        const productHrefs = fromSelector.length
          ? fromSelector
          : this.cleanUrls(all, options.baseHost).filter(href => this.matchesHints(href, PRODUCT_HREF_HINTS))

        for (const href of productHrefs) {
          if (origins.size >= options.limit) break
          if (!origins.has(href)) origins.set(href, { listingUrl: task.url, categoryName: task.categoryName })
        }

        options.onProgress?.(
          `Listado ${visited.size}/${options.maxListings}`,
          origins.size,
        )

        if (options.discoverListings) {
          for (const href of this.cleanUrls(all, options.baseHost)) {
            if (visited.size + queue.length >= options.maxListings * 2) break
            if (origins.has(href) || visited.has(href)) continue
            if (!this.matchesHints(href, LISTING_HREF_HINTS)) continue
            if (!queue.some(item => item.url === href)) {
              queue.push({ url: href, categoryName: null, pageParam: task.pageParam, depth: task.depth })
            }
          }
        }

        // Solo seguimos paginando mientras la página siga aportando productos nuevos.
        if (origins.size > before && task.depth < options.pagesPerCategory) {
          const next = await this.nextPageUrl(page, task, options.pagination)
          if (next && !visited.has(next)) {
            queue.push({
              url: next,
              categoryName: task.categoryName,
              pageParam: task.pageParam + 1,
              depth: task.depth + 1,
            })
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        this.logger.warn(`Probe listing skip url=${task.url}: ${message}`)
      }
    }

    return origins
  }

  private async settle(page: Page, waitMs: number) {
    await page
      .evaluate(async ms => {
        const step = Math.max(150, Math.floor(ms / 4))
        for (let i = 0; i < 4; i += 1) {
          window.scrollBy(0, window.innerHeight)
          await new Promise(resolve => setTimeout(resolve, step))
        }
      }, waitMs)
      .catch(() => undefined)
  }

  private async collectHrefs(page: Page, selector: string | null) {
    const all = await page
      .$$eval('a[href]', anchors => anchors.map(a => (a as HTMLAnchorElement).href).filter(Boolean))
      .catch(() => [] as string[])

    if (!selector) return { selected: [] as string[], all }

    const selected = await page
      .$$eval(selector, elements =>
        elements
          .map(el => {
            const anchor = el instanceof HTMLAnchorElement ? el : el.querySelector('a[href]')
            return anchor instanceof HTMLAnchorElement ? anchor.href : null
          })
          .filter((href): href is string => Boolean(href)),
      )
      .catch(() => [] as string[])

    return { selected, all }
  }

  private async nextPageUrl(page: Page, task: ListingTask, pagination: StoreScrapeConfig['pagination']) {
    if (pagination.type === 'query') {
      try {
        const url = new URL(task.url)
        url.searchParams.set(pagination.param, String(task.pageParam + 1))
        return url.toString()
      } catch {
        return null
      }
    }

    if (pagination.type === 'link' && pagination.nextSelector) {
      return page
        .$eval(pagination.nextSelector, el =>
          el instanceof HTMLAnchorElement ? el.href : el.querySelector('a[href]')?.getAttribute('href') ?? null,
        )
        .catch(() => null)
    }

    return null
  }

  private cleanUrls(hrefs: string[], baseHost: string): string[] {
    const cleaned: string[] = []
    for (const href of hrefs) {
      try {
        const url = new URL(href)
        if (url.host.replace(/^www\./, '') !== baseHost) continue
        const clean = `${url.origin}${url.pathname}`.replace(/\/$/, '')
        if (!cleaned.includes(clean)) cleaned.push(clean)
      } catch {
        // ignore bad URLs
      }
    }
    return cleaned
  }

  private matchesHints(url: string, hints: string[]) {
    try {
      const path = new URL(url).pathname.toLowerCase()
      return hints.some(hint => path.includes(hint))
    } catch {
      return false
    }
  }

  private async scrapeProduct(
    page: Page,
    url: string,
    origin: ProductOrigin | null,
    config: StoreScrapeConfig,
  ): Promise<ScrapedProductItem | null> {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })

    const extracted = await page.evaluate(selectors => {
      const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim() || ''

      const query = (selector: string | null) => {
        if (!selector) return null
        try {
          return document.querySelector(selector)
        } catch {
          return null
        }
      }

      const pick = (selector: string | null) => {
        const el = query(selector)
        if (!el) return null
        const value = el.getAttribute('content') || text(el)
        return value || null
      }

      const title =
        pick(selectors.name) ||
        document.querySelector('h1')?.textContent?.trim() ||
        document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
        document.title

      const configImage = query(selectors.image)
      const image =
        configImage?.getAttribute('src') ||
        configImage?.getAttribute('data-src') ||
        document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
        document.querySelector('img')?.getAttribute('src') ||
        null

      const bodyText = document.body?.innerText?.slice(0, 8000) || ''

      const breadcrumbs: string[] = []
      document
        .querySelectorAll(
          '[class*="breadcrumb" i] a, [class*="breadcrumb" i] li, [id*="breadcrumb" i] a, nav[aria-label*="readcrumb"] a',
        )
        .forEach(el => {
          const value = text(el)
          if (value && value.length <= 80 && !breadcrumbs.includes(value)) breadcrumbs.push(value)
        })

      let jsonLdCategory: string | null = null
      let jsonLdBrand: string | null = null
      let jsonLdSku: string | null = null
      let jsonLdCurrency: string | null = null
      const jsonLdPrices: string[] = []

      const readOffer = (offer: any) => {
        if (!offer || typeof offer !== 'object') return
        const price = offer.price ?? offer.lowPrice ?? offer.priceSpecification?.price
        if (price != null) jsonLdPrices.push(String(price))
        const currency = offer.priceCurrency ?? offer.priceSpecification?.priceCurrency
        if (!jsonLdCurrency && typeof currency === 'string') jsonLdCurrency = currency
      }

      const visit = (node: any) => {
        if (!node || typeof node !== 'object') return
        if (Array.isArray(node)) {
          node.forEach(visit)
          return
        }
        const type = String(node['@type'] ?? '')
        if (/product/i.test(type)) {
          if (!jsonLdCategory && typeof node.category === 'string') jsonLdCategory = node.category
          if (!jsonLdBrand) {
            const brand = node.brand
            const name = typeof brand === 'string' ? brand : brand?.name
            if (typeof name === 'string') jsonLdBrand = name
          }
          if (!jsonLdSku && typeof (node.sku ?? node.mpn) === 'string') jsonLdSku = node.sku ?? node.mpn
        }
        if (node.offers) {
          const offers = Array.isArray(node.offers) ? node.offers : [node.offers]
          offers.forEach(readOffer)
        }
        if (/breadcrumblist/i.test(type) && Array.isArray(node.itemListElement)) {
          node.itemListElement.forEach((entry: any) => {
            const name = entry?.name ?? entry?.item?.name
            if (typeof name === 'string' && !breadcrumbs.includes(name.trim())) breadcrumbs.push(name.trim())
          })
        }
        Object.values(node).forEach(visit)
      }

      document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
        try {
          visit(JSON.parse(script.textContent || ''))
        } catch {
          // ignore invalid json-ld
        }
      })

      const specPairs: Array<{ label: string; value: string }> = []
      const pushPair = (label: string, value: string) => {
        const cleanLabel = label.replace(/\s+/g, ' ').replace(/:$/, '').trim()
        const cleanValue = value.replace(/\s+/g, ' ').trim()
        if (!cleanLabel || !cleanValue) return
        if (cleanLabel.length > 60 || cleanValue.length > 300) return
        if (specPairs.length >= 60) return
        specPairs.push({ label: cleanLabel, value: cleanValue })
      }

      // El contenedor de specs del config manda: se lee antes que el resto del documento.
      const scopes = [query(selectors.specs), document.body].filter(Boolean) as Element[]
      for (const scope of scopes) {
        scope.querySelectorAll('table tr').forEach(row => {
          const cells = row.querySelectorAll('th, td')
          if (cells.length >= 2) pushPair(text(cells[0]), text(cells[cells.length - 1]))
        })
        scope.querySelectorAll('dl').forEach(list => {
          const terms = list.querySelectorAll('dt')
          const definitions = list.querySelectorAll('dd')
          terms.forEach((term, index) => pushPair(text(term), text(definitions[index])))
        })
        scope.querySelectorAll('li, p').forEach(el => {
          const match = text(el).match(/^([^:]{3,40}):\s*(.{2,200})$/)
          if (match) pushPair(match[1], match[2])
        })
      }

      const metaBrand =
        document.querySelector('meta[property="product:brand"]')?.getAttribute('content') ||
        document.querySelector('meta[itemprop="brand"]')?.getAttribute('content') ||
        null

      const attr = (selector: string, name: string) =>
        document.querySelector(selector)?.getAttribute(name) || null

      const priceCandidates: string[] = []
      const pushPrice = (value: string | null | undefined) => {
        const clean = (value ?? '').trim()
        if (clean && /\d/.test(clean) && priceCandidates.length < 40) priceCandidates.push(clean)
      }

      // Prioridad: datos estructurados > meta > selector del config > atributos > clases > texto.
      jsonLdPrices.forEach(pushPrice)
      pushPrice(attr('meta[property="product:price:amount"]', 'content'))
      pushPrice(attr('meta[itemprop="price"]', 'content'))
      pushPrice(attr('[itemprop="price"]', 'content'))
      pushPrice(text(document.querySelector('[itemprop="price"]')))
      pushPrice(pick(selectors.price))
      pushPrice(attr('[data-price-amount]', 'data-price-amount'))
      pushPrice(attr('[data-price]', 'data-price'))

      document.querySelectorAll('[class*="price" i], [id*="price" i], [class*="precio" i]').forEach(el => {
        const value = text(el)
        if (value && value.length <= 40 && /\d/.test(value)) pushPrice(value)
      })

      const bodyPrices =
        bodyText.match(
          /(?:S\/\.?|US\$|PEN|USD|\$)\s*[0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?|[0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?\s*(?:soles|pen|dolares|usd)/gi,
        ) ?? []
      bodyPrices.forEach(pushPrice)

      const priceCurrency =
        jsonLdCurrency ||
        attr('meta[property="product:price:currency"]', 'content') ||
        attr('meta[itemprop="priceCurrency"]', 'content') ||
        attr('[itemprop="priceCurrency"]', 'content') ||
        null

      return {
        title,
        image,
        breadcrumbs,
        jsonLdCategory,
        jsonLdBrand,
        jsonLdSku,
        metaBrand,
        specPairs,
        bodyText,
        priceCandidates,
        priceCurrency,
        stockQty: (() => {
          // Try to extract stock quantity from page
          const stockEl = document.querySelector('[data-stock], [data-qty], [itemprop="inventoryLevel"], .stock-qty, .stock-count')
          if (stockEl) {
            const num = parseInt(stockEl.textContent?.replace(/\D/g, '') || stockEl.getAttribute('content') || '', 10)
            if (Number.isFinite(num) && num >= 0) return num
          }
          // Check JSON-LD offers for stock
          const scripts = document.querySelectorAll('script[type="application/ld+json"]')
          for (const script of scripts) {
            try {
              const data = JSON.parse(script.textContent || '')
              const offers = data?.offers || data?.['@graph']?.find((g: any) => g.offers)?.offers
              if (offers) {
                const offer = Array.isArray(offers) ? offers[0] : offers
                if (offer?.inventoryLevel?.value != null) return Number(offer.inventoryLevel.value)
              }
            } catch {}
          }
          // Check availability text patterns
          const availEl = document.querySelector('[class*="stock" i], [class*="disponib" i], [class*="availab" i]')
          if (availEl) {
            const text = availEl.textContent || ''
            const match = text.match(/(\d+)\s*(?:unid|disponib|en stock|available)/i)
            if (match) return parseInt(match[1], 10)
          }
          return null
        })(),
      }
    }, config.product)

    const signals: ProductSignals = {
      title: extracted.title || '',
      breadcrumbs: extracted.breadcrumbs,
      jsonLdCategory: extracted.jsonLdCategory,
      jsonLdBrand: extracted.jsonLdBrand,
      jsonLdSku: extracted.jsonLdSku,
      metaBrand: extracted.metaBrand,
      specPairs: extracted.specPairs,
      bodyText: extracted.bodyText,
      productUrl: url,
      listingUrl: origin?.listingUrl ?? null,
      categoryHint: origin?.categoryName ?? null,
      priceCandidates: extracted.priceCandidates,
      priceCurrency: extracted.priceCurrency,
    }

    const category = detectCategory(signals)
    const brand = detectBrand(signals)
    const specs = extractSpecs(signals)
    const { price, currency } = detectPrice(signals)

    return {
      product: {
        name: clamp(extracted.title, 255) || 'Producto sin título',
        brand,
        model: detectModel(signals, brand),
        category,
        productUrl: url,
        imageUrl: extracted.image,
        externalSku: detectSku(signals),
      },
      price: {
        price,
        currency,
        available: price > 1,
        stockQty: extracted.stockQty ?? null,
        updatedAt: new Date().toISOString(),
      },
      specs,
      tags: buildTags({ category, brand, title: signals.title, specs }),
      confidence: this.confidenceOf({ price, category, specs }),
    }
  }

  private confidenceOf(input: { price: number; category: string | null; specs: ScrapedSpecs }): number {
    const specsFilled = Object.values(input.specs).filter(Boolean).length
    const score = 0.2 + (input.price > 1 ? 0.25 : 0) + (input.category ? 0.2 : 0) + Math.min(specsFilled, 3) * 0.1
    return Number(score.toFixed(2))
  }
}
