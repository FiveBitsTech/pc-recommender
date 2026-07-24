import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common'
import { CreateRequirementUseCase } from '../../application/use-cases/create-requirement.use-case'
import { GetRequirementUseCase } from '../../application/use-cases/get-requirement.use-case'
import { ListRequirementsUseCase } from '../../application/use-cases/list-requirements.use-case'
import { ListRecentRequirementsUseCase } from '../../application/use-cases/list-recent-requirements.use-case'
import { CreateRequirementDto } from '../dto/create-requirement.dto'

@Controller('requirements')
export class RequirementsController {
  constructor(
    private readonly listRequirementsUseCase: ListRequirementsUseCase,
    private readonly listRecentRequirementsUseCase: ListRecentRequirementsUseCase,
    private readonly getRequirementUseCase: GetRequirementUseCase,
    private readonly createRequirementUseCase: CreateRequirementUseCase,
  ) {}

  @Get()
  findAll() {
    return this.listRequirementsUseCase.execute()
  }

  @Get('recent')
  findRecent() {
    return this.listRecentRequirementsUseCase.execute()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getRequirementUseCase.execute(id)
  }

  @Post()
  create(@Body() body: CreateRequirementDto) {
    return this.createRequirementUseCase.execute(body)
  }
}
