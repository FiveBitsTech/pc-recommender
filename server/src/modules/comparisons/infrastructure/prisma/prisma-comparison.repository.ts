import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import {
  ComparisonRecord,
  ComparisonRepository,
} from '../../domain/repositories/comparison.repository'

@Injectable()
export class PrismaComparisonRepository implements ComparisonRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ComparisonRecord[]> {
    return this.prisma.productComparison.findMany({ orderBy: { id: 'desc' } })
  }
}
