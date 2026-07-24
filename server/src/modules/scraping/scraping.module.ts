import { Module } from '@nestjs/common'
import { CompaniesModule } from '../companies/companies.module'
import { IngestScrapedBatchUseCase } from './application/use-cases/ingest-scraped-batch.use-case'
import { ListScrapingHistoryUseCase } from './application/use-cases/list-scraping-history.use-case'
import { PreviewScrapingUseCase } from './application/use-cases/preview-scraping.use-case'
import { RunScrapingUseCase } from './application/use-cases/run-scraping.use-case'
import { SCRAPING_REPOSITORY } from './domain/repositories/scraping.repository'
import { FixtureStoreScraper } from './infrastructure/adapters/fixture.adapter'
import { MemoryKingsStoreScraper } from './infrastructure/adapters/memory-kings.adapter'
import {
  CyccomputerStoreScraper,
  DeltronStoreScraper,
  ImpactoStoreScraper,
} from './infrastructure/adapters/peru-stores.adapters'
import { PlaywrightStoreProbe } from './infrastructure/adapters/playwright-store-probe'
import { StoreScraperRegistry } from './infrastructure/adapters/store-scraper.registry'
import { ScrapingCron } from './infrastructure/cron/scraping.cron'
import { PrismaScrapingRepository } from './infrastructure/prisma/prisma-scraping.repository'
import { ScrapingController } from './presentation/controllers/scraping.controller'

@Module({
  imports: [CompaniesModule],
  controllers: [ScrapingController],
  providers: [
    ListScrapingHistoryUseCase,
    PreviewScrapingUseCase,
    IngestScrapedBatchUseCase,
    RunScrapingUseCase,
    PlaywrightStoreProbe,
    FixtureStoreScraper,
    MemoryKingsStoreScraper,
    CyccomputerStoreScraper,
    ImpactoStoreScraper,
    DeltronStoreScraper,
    StoreScraperRegistry,
    ScrapingCron,
    { provide: SCRAPING_REPOSITORY, useClass: PrismaScrapingRepository },
  ],
  exports: [SCRAPING_REPOSITORY, RunScrapingUseCase],
})
export class ScrapingModule {}
