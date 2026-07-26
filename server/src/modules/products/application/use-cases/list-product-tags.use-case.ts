import { Inject, Injectable } from '@nestjs/common'
import type { AdminPageParams } from '../../domain/admin-page'
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../domain/repositories/product.repository'
import { mapProductTagItem } from '../mappers/map-product-item'

@Injectable()
export class ListProductTagsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
  ) {}

  async execute(params?: AdminPageParams) {
    const result = await this.productRepository.listTags(params)
    return {
      items: result.items.map(mapProductTagItem),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    }
  }
}
