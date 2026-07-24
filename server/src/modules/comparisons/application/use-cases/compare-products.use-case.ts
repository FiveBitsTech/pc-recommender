import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../products/domain/repositories/product.repository'
import {
  COMPARISON_REPOSITORY,
  type ComparisonRepository,
} from '../../domain/repositories/comparison.repository'
import { OpenAIService } from '../../../../shared/openai/openai.service'

@Injectable()
export class CompareProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(COMPARISON_REPOSITORY)
    private readonly comparisonRepository: ComparisonRepository,
    private readonly openAIService: OpenAIService,
  ) {}

  async execute(productOneId: number, productTwoId: number) {
    if (productOneId === productTwoId) {
      throw new BadRequestException('Cannot compare a product with itself')
    }

    // Check if comparison already exists (cache)
    const existing = await this.comparisonRepository.findByProducts(productOneId, productTwoId)

    if (existing && existing.analysis) {
      try {
        return JSON.parse(existing.analysis)
      } catch {
        // If stored analysis is not valid JSON, regenerate
      }
    }

    // Fetch products
    const [product1, product2] = await Promise.all([
      this.productRepository.findById(productOneId),
      this.productRepository.findById(productTwoId),
    ])

    if (!product1) throw new NotFoundException(`Product ${productOneId} not found`)
    if (!product2) throw new NotFoundException(`Product ${productTwoId} not found`)

    // Generate with AI
    const result = await this.openAIService.generateComparison({
      product1: {
        id: product1.id,
        name: product1.name,
        brand: product1.brand,
        category: product1.category,
        specs: product1.specs,
        price: Number(product1.latestPrice?.price ?? 0),
      },
      product2: {
        id: product2.id,
        name: product2.name,
        brand: product2.brand,
        category: product2.category,
        specs: product2.specs,
        price: Number(product2.latestPrice?.price ?? 0),
      },
    })

    if (!result) {
      return {
        analysis: 'No se pudo generar la comparación en este momento.',
        winner: null,
        specs_comparison: [],
      }
    }

    // Persist in DB for future cache
    await this.comparisonRepository.create({
      productOneId,
      productTwoId,
      analysis: JSON.stringify(result),
    })

    return result
  }
}
