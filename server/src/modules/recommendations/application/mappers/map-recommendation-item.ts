import { RecommendationRecord } from '../../domain/repositories/recommendation.repository'

export const mapRecommendationItem = (item: RecommendationRecord) => ({
  id: item.id,
  requirementId: item.requirementId,
  productId: item.productId,
  score: Number(item.score),
  reason: item.reason,
  createdAt: item.createdAt,
})
