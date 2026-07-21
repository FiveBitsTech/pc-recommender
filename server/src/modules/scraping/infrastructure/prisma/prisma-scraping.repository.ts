import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import {
  ScrapingHistoryRecord,
  ScrapingRepository,
} from '../../domain/repositories/scraping.repository'

@Injectable()
export class PrismaScrapingRepository implements ScrapingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ScrapingHistoryRecord[]> {
    return this.prisma.scrapingHistory.findMany({ orderBy: { executedAt: 'desc' } })
  }
}
