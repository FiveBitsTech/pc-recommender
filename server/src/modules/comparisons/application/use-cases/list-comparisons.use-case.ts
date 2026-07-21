import { Inject, Injectable } from '@nestjs/common'
import {
  COMPARISON_REPOSITORY,
  type ComparisonRepository,
} from '../../domain/repositories/comparison.repository'
import { mapComparisonItem } from '../mappers/map-comparison-item'

@Injectable()
export class ListComparisonsUseCase {
  constructor(
    @Inject(COMPARISON_REPOSITORY)
    private readonly comparisonRepository: ComparisonRepository,
  ) {}

  async execute() {
    const items = await this.comparisonRepository.findAll()
    return { items: items.map(mapComparisonItem) }
  }
}
