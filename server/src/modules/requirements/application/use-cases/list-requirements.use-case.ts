import { Inject, Injectable } from '@nestjs/common'
import {
  REQUIREMENT_REPOSITORY,
  type RequirementRepository,
} from '../../domain/repositories/requirement.repository'
import { mapRequirementItem } from '../mappers/map-requirement-item'

@Injectable()
export class ListRequirementsUseCase {
  constructor(
    @Inject(REQUIREMENT_REPOSITORY)
    private readonly requirementRepository: RequirementRepository,
  ) {}

  async execute() {
    const requirements = await this.requirementRepository.findAll()
    return { items: requirements.map(mapRequirementItem) }
  }
}
