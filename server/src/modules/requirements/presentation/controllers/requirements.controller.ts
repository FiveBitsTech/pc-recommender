import { Body, Controller, Get, Post } from '@nestjs/common'
import { CreateRequirementUseCase } from '../../application/use-cases/create-requirement.use-case'
import { ListRequirementsUseCase } from '../../application/use-cases/list-requirements.use-case'
import { CreateRequirementDto } from '../dto/create-requirement.dto'

@Controller('requirements')
export class RequirementsController {
  constructor(
    private readonly listRequirementsUseCase: ListRequirementsUseCase,
    private readonly createRequirementUseCase: CreateRequirementUseCase,
  ) {}

  @Get()
  findAll() {
    return this.listRequirementsUseCase.execute()
  }

  @Post()
  create(@Body() body: CreateRequirementDto) {
    return this.createRequirementUseCase.execute(body)
  }
}
