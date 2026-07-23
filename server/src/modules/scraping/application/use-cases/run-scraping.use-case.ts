import { Inject, Injectable, Logger } from '@nestjs/common'
import {
  SCRAPING_REPOSITORY,
  type ScrapingRepository,
} from '../../domain/repositories/scraping.repository'
import { StoreScraperRegistry } from '../../infrastructure/adapters/store-scraper.registry'
import { IngestScrapedBatchUseCase } from './ingest-scraped-batch.use-case'

@Injectable()
export class RunScrapingUseCase {
  private readonly logger = new Logger(RunScrapingUseCase.name)

  constructor(
    private readonly registry: StoreScraperRegistry,
    private readonly ingestScrapedBatch: IngestScrapedBatchUseCase,
    @Inject(SCRAPING_REPOSITORY) private readonly scrapingRepository: ScrapingRepository,
  ) {}

  async execute(source: string, options?: { dryRun?: boolean }) {
    const scraper = this.registry.resolve(source)
    this.logger.log(`Scraping start source=${scraper.source} dryRun=${Boolean(options?.dryRun)}`)

    let companyIdForHistory: number | null = null

    try {
      const batch = await scraper.scrape()

      if (options?.dryRun) {
        return {
          status: 'preview' as const,
          dryRun: true,
          persisted: false,
          source: batch.run.source,
          adapter: batch.run.adapter,
          scrapedAt: batch.run.scrapedAt,
          company: batch.company,
          productsFound: batch.products.length,
          products: batch.products,
          note: 'Dry run — nothing was saved. Call again without dryRun to persist.',
        }
      }

      const result = await this.ingestScrapedBatch.execute(batch)
      companyIdForHistory = result.companyId
      const history = await this.scrapingRepository.create({
        companyId: result.companyId,
        source: batch.run.source,
        status: 'success',
        productsFound: result.productsIngested,
      })

      this.logger.log(
        `Scraping OK source=${batch.run.source} products=${result.productsIngested}`,
      )

      return {
        status: 'success' as const,
        dryRun: false,
        persisted: true,
        source: batch.run.source,
        adapter: batch.run.adapter,
        companyId: result.companyId,
        productsFound: result.productsIngested,
        historyId: history.id,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(`Scraping failed source=${source}: ${message}`)

      if (companyIdForHistory != null) {
        await this.scrapingRepository.create({
          companyId: companyIdForHistory,
          source,
          status: 'failed',
          productsFound: 0,
          errorMessage: message,
        })
      }

      throw error
    }
  }
}
