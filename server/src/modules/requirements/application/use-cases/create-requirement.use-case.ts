import { Inject, Injectable } from '@nestjs/common'
import {
  REQUIREMENT_REPOSITORY,
  type RequirementRepository,
} from '../../domain/repositories/requirement.repository'
import { mapRequirementItem } from '../mappers/map-requirement-item'

type Input = {
  usageType: string
  budget: number
  priority: string
  deviceType: string
}

@Injectable()
export class CreateRequirementUseCase {
  constructor(
    @Inject(REQUIREMENT_REPOSITORY)
    private readonly requirementRepository: RequirementRepository,
  ) {}

  async execute(input: Input) {
    const requirement = await this.requirementRepository.create(input)
    return mapRequirementItem(requirement)
  }
}
