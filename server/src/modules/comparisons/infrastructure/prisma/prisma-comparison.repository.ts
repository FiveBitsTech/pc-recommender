import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import {
  ComparisonRecord,
  ComparisonRepository,
  CreateComparisonInput,
} from '../../domain/repositories/comparison.repository'

@Injectable()
export class PrismaComparisonRepository implements ComparisonRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ComparisonRecord[]> {
    return this.prisma.productComparison.findMany({ orderBy: { id: 'desc' } })
  }

  async findByProducts(productOneId: number, productTwoId: number): Promise<ComparisonRecord | null> {
    // Check both directions (A vs B or B vs A)
    const record = await this.prisma.productComparison.findFirst({
      where: {
        OR: [
          { productOneId, productTwoId },
          { productOneId: productTwoId, productTwoId: productOneId },
        ],
      },
    })

    return record
  }

  create(data: CreateComparisonInput): Promise<ComparisonRecord> {
    return this.prisma.productComparison.create({
      data: {
        productOneId: data.productOneId,
        productTwoId: data.productTwoId,
        analysis: data.analysis,
      },
    })
  }
}
