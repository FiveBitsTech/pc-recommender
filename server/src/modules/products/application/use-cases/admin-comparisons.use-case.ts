import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../domain/repositories/product.repository'

@Injectable()
export class ListAdminComparisonsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute() {
    const rows = await this.productRepository.listAdminComparisons()
    return { items: rows }
  }
}

@Injectable()
export class DeleteAdminComparisonUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: number) {
    const ok = await this.productRepository.deleteComparisonById(id)
    if (!ok) throw new NotFoundException('Comparación no encontrada')
    return { deleted: true, id }
  }
}
