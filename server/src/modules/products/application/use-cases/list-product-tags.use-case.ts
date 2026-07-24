import { Inject, Injectable } from '@nestjs/common'
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

  async execute() {
    const tags = await this.productRepository.listTags()
    return { items: tags.map(mapProductTagItem) }
  }
}
