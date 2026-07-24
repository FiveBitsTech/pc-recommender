import { Inject, Injectable } from '@nestjs/common'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../domain/repositories/product.repository'

@Injectable()
export class ListAdminPricesUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute() {
    const rows = await this.productRepository.listAdminPrices()
    return {
      items: rows.map((r) => ({
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
    }
  }
}
