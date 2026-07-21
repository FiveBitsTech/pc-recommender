import { Inject, Injectable } from '@nestjs/common'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../domain/repositories/product.repository'
import { mapProductItem } from '../mappers/map-product-item'

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute() {
    const products = await this.productRepository.findAll()
    return { items: products.map(mapProductItem) }
  }
}
