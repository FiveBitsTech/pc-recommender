import { Inject, Injectable } from '@nestjs/common'
import type { AdminPageParams } from '../../domain/admin-page'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../domain/repositories/product.repository'

@Injectable()
export class ListAdminSpecsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute(params?: AdminPageParams) {
    return this.productRepository.listAdminSpecs(params)
  }
}
