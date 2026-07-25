import { Inject, Injectable } from '@nestjs/common'
import type { AdminPageParams } from '../../domain/admin-page'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../domain/repositories/product.repository'

@Injectable()
export class ListAdminPricesUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute(params?: AdminPageParams) {
    const result = await this.productRepository.listAdminPrices(params)
    return {
      items: result.items.map((r) => ({
        id: r.id,
        productId: r.productId,
        productName: r.productName,
        companyName: r.companyName,
        price: Number(r.price),
        currency: r.currency,
        available: r.available,
        stockQty: r.stockQty,
        updatedAt: r.updatedAt,
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    }
  }
}
