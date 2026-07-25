export type ScrapeCategory = { name: string | null; url: string }

export type PaginationType = 'link' | 'query' | 'client' | 'unknown'

export type StoreScrapeConfig = {
  baseUrl: string | null
  categories: ScrapeCategory[]
  listing: { productLinkSelector: string | null; waitMs: number; maxPages: number }
  pagination: { type: PaginationType; nextSelector: string | null; param: string; start: number }
  product: { name: string | null; price: string | null; image: string | null; specs: string | null }
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

const asText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const clean = value.trim()
  return clean ? clean : null
}

// La IA a veces devuelve selectores inventados o con placeholders; descartamos lo inusable.
const asSelector = (value: unknown): string | null => {
  const text = asText(value)
  if (!text || text.length > 200) return null
  if (/[<>{}]/.test(text) || /^(string|n\/a|none|null|unknown)$/i.test(text)) return null
  return text
}

const asNumber = (value: unknown, fallback: number, min: number, max: number): number => {
  const parsed = typeof value === 'number' ? value : Number(asText(value) ?? NaN)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(parsed)))
}

const absoluteUrl = (value: unknown, baseUrl: string | null): string | null => {
  const text = asText(value)
  if (!text) return null
  try {
    return new URL(text, baseUrl ?? undefined).toString()
  } catch {
    return null
  }
}

const PAGINATION_TYPES: PaginationType[] = ['link', 'query', 'client', 'unknown']

export const normalizeScrapeConfig = (raw: unknown, fallbackBaseUrl: string): StoreScrapeConfig => {
  const root = asRecord(raw)
  const baseUrl = absoluteUrl(root.baseUrl, fallbackBaseUrl) ?? fallbackBaseUrl

  const categories: ScrapeCategory[] = []
  const rawCategories = Array.isArray(root.categories) ? root.categories : []
  for (const entry of rawCategories) {
    const item = asRecord(entry)
    const url = absoluteUrl(item.url, baseUrl)
    if (!url || categories.some(category => category.url === url)) continue
    categories.push({ name: asText(item.name), url })
  }

  const listing = asRecord(root.listing)
  const pagination = asRecord(root.pagination)
  const product = asRecord(root.product)
  const paginationType = asText(pagination.type)?.toLowerCase() as PaginationType | undefined

  return {
    baseUrl,
    categories,
    listing: {
      productLinkSelector: asSelector(listing.productLinkSelector),
      waitMs: asNumber(listing.waitMs, 1400, 300, 8000),
      maxPages: asNumber(listing.maxPages, 3, 1, 10),
    },
    pagination: {
      type: paginationType && PAGINATION_TYPES.includes(paginationType) ? paginationType : 'unknown',
      nextSelector: asSelector(pagination.nextSelector),
      param: asText(pagination.param) ?? 'page',
      start: asNumber(pagination.start, 1, 0, 1),
    },
    product: {
      name: asSelector(product.name),
      price: asSelector(product.price),
      image: asSelector(product.image),
      specs: asSelector(product.specs),
    },
  }
}
