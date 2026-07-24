import { Module } from '@nestjs/common'
import { CompaniesModule } from '../companies/companies.module'
import { IngestScrapedBatchUseCase } from './application/use-cases/ingest-scraped-batch.use-case'
import { ClearScrapingCatalogUseCase } from './application/use-cases/clear-scraping-catalog.use-case'
import { ListScrapingHistoryUseCase } from './application/use-cases/list-scraping-history.use-case'
import { RunScrapingUseCase } from './application/use-cases/run-scraping.use-case'
import { SCRAPING_REPOSITORY } from './domain/repositories/scraping.repository'
import { PlaywrightStoreProbe } from './infrastructure/adapters/playwright-store-probe'
import { ScrapingCron } from './infrastructure/cron/scraping.cron'
import { PrismaScrapingRepository } from './infrastructure/prisma/prisma-scraping.repository'
import { ScrapingController } from './presentation/controllers/scraping.controller'

@Module({
  imports: [CompaniesModule],
  controllers: [ScrapingController],
  providers: [
    ListScrapingHistoryUseCase,
    IngestScrapedBatchUseCase,
    ClearScrapingCatalogUseCase,
    RunScrapingUseCase,
    PlaywrightStoreProbe,
    ScrapingCron,
    { provide: SCRAPING_REPOSITORY, useClass: PrismaScrapingRepository },
  ],
  exports: [SCRAPING_REPOSITORY, RunScrapingUseCase],
})
export class ScrapingModule {}
