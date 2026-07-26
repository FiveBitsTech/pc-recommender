import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { AdminPageParams } from '../../domain/admin-page'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../domain/repositories/product.repository'

@Injectable()
export class ListAdminRecommendationsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute(params?: AdminPageParams) {
    const result = await this.productRepository.listAdminRecommendations(params)
    return {
      items: result.items.map((r) => ({
        id: r.id,
        productId: r.productId,
        productName: r.productName,
        requirementId: r.requirementId,
        score: Number(r.score),
        reason: r.reason,
        createdAt: r.createdAt,
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
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
