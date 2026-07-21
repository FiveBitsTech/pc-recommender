import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import {
  RecommendationRecord,
  RecommendationRepository,
} from '../../domain/repositories/recommendation.repository'

@Injectable()
export class PrismaRecommendationRepository implements RecommendationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByRequirementId(requirementId: number): Promise<RecommendationRecord[]> {
    return this.prisma.recommendation.findMany({
      where: { requirementId },
      orderBy: { score: 'desc' },
    })
  }
}
