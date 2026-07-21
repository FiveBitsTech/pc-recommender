import { Inject, Injectable } from '@nestjs/common'
import { TAG_REPOSITORY, type TagRepository } from '../../domain/repositories/tag.repository'
import { mapTagItem } from '../mappers/map-tag-item'

@Injectable()
export class ListTagsUseCase {
  constructor(@Inject(TAG_REPOSITORY) private readonly tagRepository: TagRepository) {}

  async execute() {
    const tags = await this.tagRepository.findAll()
    return { items: tags.map(mapTagItem) }
  }
}
