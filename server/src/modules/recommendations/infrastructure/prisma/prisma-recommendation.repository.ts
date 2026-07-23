import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import {
  RecommendationRecord,
  RecommendationRepository,
} from '../../domain/repositories/recommendation.repository'

@Injectable()
export class PrismaRecommendationRepository implements RecommendationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByRequirementId(requirementId: number): Promise<RecommendationRecord[]> {
    const records = await this.prisma.recommendation.findMany({
      where: { requirementId },
      orderBy: { score: 'desc' },
      include: {
        product: {
          include: {
            company: { select: { id: true, name: true } },
            specs: {
              select: {
                processor: true,
                gpu: true,
                ram: true,
                storage: true,
                screen: true,
                operatingSystem: true,
              },
            },
            prices: {
              orderBy: { updatedAt: 'desc' },
              take: 1,
              select: { price: true },
            },
          },
        },
      },
    })

    return records.map((r) => ({
      id: r.id,
      requirementId: r.requirementId,
      productId: r.productId,
      score: r.score,
      reason: r.reason,
      createdAt: r.createdAt,
      product: {
        id: r.product.id,
        name: r.product.name,
        brand: r.product.brand,
        model: r.product.model,
        category: r.product.category,
        productUrl: r.product.productUrl,
        imageUrl: r.product.imageUrl,
        company: r.product.company ?? null,
        specs: r.product.specs ?? null,
        price: r.product.prices[0] ? Number(r.product.prices[0].price) : null,
      },
    }))
  }
}
