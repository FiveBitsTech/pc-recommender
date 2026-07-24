import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
  type ProductUpdateInput,
} from '../../domain/repositories/product.repository'
import { mapAdminProductItem } from '../mappers/map-product-item'

@Injectable()
export class UpdateAdminProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: number, data: ProductUpdateInput) {
    const product = await this.productRepository.updateAdmin(id, data)
    if (!product) throw new NotFoundException('Producto no encontrado')
    return mapAdminProductItem(product)
  }
}
