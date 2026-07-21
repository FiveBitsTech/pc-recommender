import { ScrapingHistoryRecord } from '../../domain/repositories/scraping.repository'

export const mapScrapingItem = (item: ScrapingHistoryRecord) => ({
  id: item.id,
  companyId: item.companyId,
  status: item.status,
  productsFound: item.productsFound,
  executedAt: item.executedAt,
})
