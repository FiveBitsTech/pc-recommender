import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../../products/domain/repositories/product.repository'
import { OpenAIService } from '../../../../shared/openai/openai.service'

@Injectable()
export class CompareProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    private readonly openAIService: OpenAIService,
  ) {}

  async execute(productIds: number[]) {
    if (productIds.length < 2 || productIds.length > 3) {
      throw new BadRequestException('Must compare 2 or 3 products')
    }

    const uniqueIds = [...new Set(productIds)]

    if (uniqueIds.length < 2) {
      throw new BadRequestException('Cannot compare a product with itself')
    }

    // Fetch all products
    const products = await Promise.all(
      uniqueIds.map((id) => this.productRepository.findById(id)),
    )

    for (let i = 0; i < products.length; i++) {
      if (!products[i]) {
        throw new NotFoundException(`Product ${uniqueIds[i]} not found`)
      }
    }

    const toAIProduct = (p: NonNullable<(typeof products)[0]>) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      specs: p.specs,
      price: Number(p.latestPrice?.price ?? 0),
    })

    const result = await this.openAIService.generateComparison({
      product1: toAIProduct(products[0]!),
      product2: toAIProduct(products[1]!),
      product3: products[2] ? toAIProduct(products[2]) : undefined,
    })

    if (!result) {
      return {
        recommendation: null,
        summary: [],
        specs_comparison: [],
        ratings: [],
      }
    }

    return result
  }
}
