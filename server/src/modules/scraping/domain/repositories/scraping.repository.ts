export type ScrapingHistoryRecord = {
  id: number
  companyId: number
  source: string
  status: string
  productsFound: number
  errorMessage: string | null
  executedAt: Date
}

export type CreateScrapingHistoryInput = {
  companyId: number
  source: string
  status: string
  productsFound: number
  errorMessage?: string | null
}

export const SCRAPING_REPOSITORY = 'SCRAPING_REPOSITORY'

export interface ScrapingRepository {
  findAll(): Promise<ScrapingHistoryRecord[]>
  findLatestSuccessBySource(source: string): Promise<ScrapingHistoryRecord | null>
  create(input: CreateScrapingHistoryInput): Promise<ScrapingHistoryRecord>
}
