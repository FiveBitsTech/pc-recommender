import { ScrapingHistoryRecord } from '../../domain/repositories/scraping.repository'

export const mapScrapingItem = (item: ScrapingHistoryRecord) => ({
  id: item.id,
  companyId: item.companyId,
  source: item.source,
  status: item.status,
  productsFound: item.productsFound,
  errorMessage: item.errorMessage,
  executedAt: item.executedAt,
})
