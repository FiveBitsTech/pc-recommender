export const RECOMMENDATION_REPOSITORY = 'RECOMMENDATION_REPOSITORY'

export type RecommendationProductSpec = {
  processor: string | null
  gpu: string | null
  ram: string | null
  storage: string | null
  screen: string | null
  operatingSystem: string | null
}

export type RecommendationProduct = {
  id: number
  name: string
  brand: string | null
  model: string | null
  category: string | null
  productUrl: string | null
  imageUrl: string | null
  company: { id: number; name: string } | null
  specs: RecommendationProductSpec | null
  price: number | null
}

export type RecommendationRecord = {
  id: number
  requirementId: number
  productId: number
  score: { toString(): string }
  reason: string | null
  product: RecommendationProduct
  createdAt: Date
}

export interface RecommendationRepository {
  findByRequirementId(requirementId: number): Promise<RecommendationRecord[]>
}
