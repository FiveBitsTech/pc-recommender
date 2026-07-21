import { Module } from '@nestjs/common'
import { ListScrapingHistoryUseCase } from './application/use-cases/list-scraping-history.use-case'
import { SCRAPING_REPOSITORY } from './domain/repositories/scraping.repository'
import { PrismaScrapingRepository } from './infrastructure/prisma/prisma-scraping.repository'
import { ScrapingController } from './presentation/controllers/scraping.controller'

@Module({
  controllers: [ScrapingController],
  providers: [
    ListScrapingHistoryUseCase,
    { provide: SCRAPING_REPOSITORY, useClass: PrismaScrapingRepository },
  ],
  exports: [SCRAPING_REPOSITORY],
})
export class ScrapingModule {}
