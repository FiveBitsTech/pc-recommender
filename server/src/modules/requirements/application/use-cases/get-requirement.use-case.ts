import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  REQUIREMENT_REPOSITORY,
  type RequirementRepository,
} from '../../domain/repositories/requirement.repository'
import { mapRequirementItem } from '../mappers/map-requirement-item'

@Injectable()
export class GetRequirementUseCase {
  constructor(
    @Inject(REQUIREMENT_REPOSITORY)
    private readonly requirementRepository: RequirementRepository,
  ) {}

  async execute(id: number) {
    const requirement = await this.requirementRepository.findById(id)

    if (!requirement) {
      throw new NotFoundException(`Requirement with id ${id} not found`)
    }

    return mapRequirementItem(requirement)
  }
}
