import { RecommendationRecord } from '../../domain/repositories/recommendation.repository'

export const mapRecommendationItem = (item: RecommendationRecord) => ({
  id: item.id,
  requirementId: item.requirementId,
  score: Number(item.score),
  reason: item.reason,
  createdAt: item.createdAt,
  product: {
    id: item.product.id,
    name: item.product.name,
    brand: item.product.brand,
    model: item.product.model,
    category: item.product.category,
    productUrl: item.product.productUrl,
    imageUrl: item.product.imageUrl,
    company: item.product.company,
    specs: item.product.specs,
    price: item.product.price,
  },
})
