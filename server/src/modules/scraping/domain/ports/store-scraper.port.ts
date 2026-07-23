export type ScrapedRunMeta = {
  source: string
  scrapedAt: string
  adapter: string
}

export type ScrapedCompany = {
  slug: string
  name: string
  website?: string | null
  logoUrl?: string | null
}

export type ScrapedProductInfo = {
  name: string
  brand?: string | null
  model?: string | null
  category?: string | null
  productUrl: string
  imageUrl?: string | null
  externalSku?: string | null
}

export type ScrapedPrice = {
  price: number
  currency: string
  available: boolean
  stockQty?: number | null
  updatedAt: string
}

export type ScrapedSpecs = {
  processor?: unknown
  gpu?: unknown
  ram?: unknown
  storage?: unknown
  screen?: unknown
  operating_system?: unknown
  operatingSystem?: unknown
  [key: string]: unknown
}

export type ScrapedProductItem = {
  product: ScrapedProductInfo
  price: ScrapedPrice
  specs?: ScrapedSpecs | null
  tags?: string[]
  confidence?: number
}

export type ScrapedBatch = {
  run: ScrapedRunMeta
  company: ScrapedCompany
  products: ScrapedProductItem[]
}

export const STORE_SCRAPER = 'STORE_SCRAPER'

export interface StoreScraper {
  readonly source: string
  scrape(): Promise<ScrapedBatch>
}
