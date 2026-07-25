import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../domain/repositories/product.repository'
import { mapAdminProductItem } from '../mappers/map-product-item'

@Injectable()
export class GetAdminProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: number) {
    const product = await this.productRepository.findAdminById(id)
    if (!product) throw new NotFoundException('Producto no encontrado')
    return mapAdminProductItem(product)
  }
}
