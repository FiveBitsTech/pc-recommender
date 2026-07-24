import { Inject, Injectable } from '@nestjs/common'
import {
  PRODUCT_REPOSITORY,
  type ProductAdminListParams,
  type ProductRepository,
} from '../../domain/repositories/product.repository'
import { mapAdminProductItem } from '../mappers/map-product-item'

@Injectable()
export class ListAdminProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute(params?: ProductAdminListParams) {
    const products = await this.productRepository.findAdminAll(params)
    return { items: products.map(mapAdminProductItem) }
  }
}
