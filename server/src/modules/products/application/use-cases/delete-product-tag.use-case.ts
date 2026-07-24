import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../domain/repositories/product.repository'

@Injectable()
export class DeleteProductTagUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: number) {
    const ok = await this.productRepository.deleteTagById(id)
    if (!ok) throw new NotFoundException('Tag no encontrado')
    return { deleted: true, id }
  }
}
