import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../domain/repositories/product.repository'

@Injectable()
export class ListAdminRecommendationsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute() {
    const rows = await this.productRepository.listAdminRecommendations()
    return {
      items: rows.map((r) => ({
        id: r.id,
        productId: r.productId,
        productName: r.productName,
        requirementId: r.requirementId,
        score: Number(r.score),
        reason: r.reason,
        createdAt: r.createdAt,
      })),
    }
  }
}

@Injectable()
export class DeleteAdminRecommendationUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: number) {
    const ok = await this.productRepository.deleteRecommendationById(id)
    if (!ok) throw new NotFoundException('Recomendación no encontrada')
    return { deleted: true, id }
  }
}
