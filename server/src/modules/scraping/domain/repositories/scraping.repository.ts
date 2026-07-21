export const SCRAPING_REPOSITORY = 'SCRAPING_REPOSITORY'

export type ScrapingHistoryRecord = {
  id: number
  companyId: number
  status: string
  productsFound: number
  executedAt: Date
}

export interface ScrapingRepository {
  findAll(): Promise<ScrapingHistoryRecord[]>
}
