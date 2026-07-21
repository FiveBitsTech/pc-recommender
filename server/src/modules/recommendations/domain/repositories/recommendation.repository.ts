export const RECOMMENDATION_REPOSITORY = 'RECOMMENDATION_REPOSITORY'

export type RecommendationRecord = {
  id: number
  requirementId: number
  productId: number
  score: { toString(): string }
  reason: string | null
  createdAt: Date
}

export interface RecommendationRepository {
  findByRequirementId(requirementId: number): Promise<RecommendationRecord[]>
}
