import { Inject, Injectable } from '@nestjs/common'
import {
  RECOMMENDATION_REPOSITORY,
  type RecommendationRepository,
} from '../../domain/repositories/recommendation.repository'
import {
  REQUIREMENT_REPOSITORY,
  type RequirementRepository,
} from '../../../requirements/domain/repositories/requirement.repository'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../products/domain/repositories/product.repository'
import { OpenAIService } from '../../../../shared/openai/openai.service'
import { mapRecommendationItem } from '../mappers/map-recommendation-item'

@Injectable()
export class ListRecommendationsByRequirementUseCase {
  constructor(
    @Inject(RECOMMENDATION_REPOSITORY)
    private readonly recommendationRepository: RecommendationRepository,
    @Inject(REQUIREMENT_REPOSITORY)
    private readonly requirementRepository: RequirementRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    private readonly openAIService: OpenAIService,
  ) {}

  async execute(requirementId: number) {
    // First try pre-generated recommendations
    const items = await this.recommendationRepository.findByRequirementId(requirementId)

    if (items.length > 0) {
      return { items: items.map(mapRecommendationItem) }
    }

    // Fallback: find products + generate AI recommendations
    const requirement = await this.requirementRepository.findById(requirementId)

    if (!requirement) {
      return { items: [] }
    }

    const budget = Number(requirement.budget)

    const products = await this.productRepository.findByFilters({
      category: requirement.deviceType,
      maxPrice: budget * 1.2,
      limit: 8,
    })

    if (products.length === 0) {
      return { items: [] }
    }

    // Prepare products for AI analysis
    const productsForAI = products.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      specs: p.specs,
      price: Number(p.latestPrice?.price ?? 0),
    }))

    // Call OpenAI for intelligent recommendations
    const aiRecommendations = await this.openAIService.generateRecommendations({
      usageType: requirement.usageType,
      budget,
      priority: requirement.priority,
      deviceType: requirement.deviceType,
      brandPreference: requirement.brandPreference ?? null,
      products: productsForAI,
    })

    // If AI returned results, persist and map them
    if (aiRecommendations.length > 0) {
      const productMap = new Map(products.map((p) => [p.id, p]))

      // Persist recommendations in DB so they survive page reload
      await this.recommendationRepository.createMany(
        aiRecommendations.map((rec) => ({
          requirementId,
          productId: rec.productId,
          score: rec.score,
          reason: rec.reason,
        })),
      )

      const result = aiRecommendations.map((rec) => {
        const product = productMap.get(rec.productId)!

        return {
          id: rec.productId * -1,
          requirementId,
          score: rec.score,
          reason: rec.reason,
          advantages: rec.advantages ?? [],
          disadvantages: rec.disadvantages ?? [],
          limitations: rec.limitations ?? [],
          upgradeOptions: rec.upgradeOptions ?? [],
          overpriced: rec.overpriced ?? false,
          priceVerdict: rec.priceVerdict ?? null,
          createdAt: new Date(),
          product: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            model: product.model,
            category: product.category,
            productUrl: product.productUrl,
            imageUrl: product.imageUrl,
            company: null,
            specs: product.specs,
            price: Number(product.latestPrice?.price ?? 0),
          },
        }
      })

      return { items: result }
    }

    // Final fallback: basic price-sorted recommendations if AI fails
    const sorted = [...products]
      .sort((a, b) => Number(a.latestPrice?.price ?? 0) - Number(b.latestPrice?.price ?? 0))
      .slice(0, 3)

    const fallbackItems = sorted.map((product, index) => {
      const price = Number(product.latestPrice?.price ?? 0)
      const withinBudget = price <= budget
      const score = withinBudget ? 8.0 + (index * 0.5) : 7.0

      const reasons = [
        `Opción económica para ${requirement.usageType}. ${product.specs?.processor ?? ''} ofrece buen rendimiento base.`,
        `Buen equilibrio precio-rendimiento para ${requirement.usageType}. ${product.specs?.ram ?? ''} RAM y ${product.specs?.storage ?? ''} aseguran fluidez.`,
        `Máximo rendimiento en tu rango para ${requirement.usageType}. ${product.specs?.processor ?? ''} + ${product.specs?.gpu ?? ''}.`,
      ]

      return {
        id: product.id * -1,
        requirementId,
        score,
        reason: reasons[index] ?? reasons[0],
        createdAt: new Date(),
        product: {
          id: product.id,
          name: product.name,
          brand: product.brand,
          model: product.model,
          category: product.category,
          productUrl: product.productUrl,
          imageUrl: product.imageUrl,
          company: null,
          specs: product.specs,
          price,
        },
      }
    })

    return { items: fallbackItems }
  }
}
