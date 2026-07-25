import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import {
  CreateScrapingHistoryInput,
  ScrapingHistoryRecord,
  ScrapingRepository,
} from '../../domain/repositories/scraping.repository'

@Injectable()
export class PrismaScrapingRepository implements ScrapingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ScrapingHistoryRecord[]> {
    return this.prisma.scrapingHistory.findMany({ orderBy: { executedAt: 'desc' } })
  }

  findLatestSuccessBySource(source: string): Promise<ScrapingHistoryRecord | null> {
    return this.prisma.scrapingHistory.findFirst({
      where: { source, status: 'success' },
      orderBy: { executedAt: 'desc' },
    })
  }

  create(input: CreateScrapingHistoryInput): Promise<ScrapingHistoryRecord> {
    return this.prisma.scrapingHistory.create({
      data: {
        companyId: input.companyId,
        source: input.source,
        status: input.status,
        productsFound: input.productsFound,
        errorMessage: input.errorMessage ?? null,
      },
    })
  }
}
