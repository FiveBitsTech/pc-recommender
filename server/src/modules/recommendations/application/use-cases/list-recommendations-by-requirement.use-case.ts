import { Inject, Injectable } from '@nestjs/common'
import {
  RECOMMENDATION_REPOSITORY,
  type RecommendationRepository,
} from '../../domain/repositories/recommendation.repository'
import { mapRecommendationItem } from '../mappers/map-recommendation-item'

@Injectable()
export class ListRecommendationsByRequirementUseCase {
  constructor(
    @Inject(RECOMMENDATION_REPOSITORY)
    private readonly recommendationRepository: RecommendationRepository,
  ) {}

  async execute(requirementId: number) {
    const items = await this.recommendationRepository.findByRequirementId(requirementId)
    return { items: items.map(mapRecommendationItem) }
  }
}
