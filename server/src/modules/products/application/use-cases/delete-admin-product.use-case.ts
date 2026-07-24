import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../domain/repositories/product.repository'

@Injectable()
export class DeleteAdminProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: number) {
    const ok = await this.productRepository.deleteById(id)
    if (!ok) throw new NotFoundException('Producto no encontrado')
    return { deleted: true, id }
  }
}
