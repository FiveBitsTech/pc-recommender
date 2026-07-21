import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { ListRecommendationsByRequirementUseCase } from '../../application/use-cases/list-recommendations-by-requirement.use-case'

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly listRecommendationsByRequirementUseCase: ListRecommendationsByRequirementUseCase,
  ) {}

  @Get('by-requirement/:requirementId')
  findByRequirement(@Param('requirementId', ParseIntPipe) requirementId: number) {
    return this.listRecommendationsByRequirementUseCase.execute(requirementId)
  }
}
