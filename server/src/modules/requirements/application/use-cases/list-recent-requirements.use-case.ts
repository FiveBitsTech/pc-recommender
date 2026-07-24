import { Inject, Injectable } from '@nestjs/common'
import {
  REQUIREMENT_REPOSITORY,
  type RequirementRepository,
} from '../../domain/repositories/requirement.repository'
import { mapRequirementItem } from '../mappers/map-requirement-item'

@Injectable()
export class ListRecentRequirementsUseCase {
  constructor(
    @Inject(REQUIREMENT_REPOSITORY)
    private readonly requirementRepository: RequirementRepository,
  ) {}

  async execute() {
    const records = await this.requirementRepository.findRecent(6)

    return { items: records.map(mapRequirementItem) }
  }
}
