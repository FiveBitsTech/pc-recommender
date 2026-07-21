import { Controller, Get } from '@nestjs/common'
import { ListCompaniesUseCase } from '../../application/use-cases/list-companies.use-case'

@Controller('companies')
export class CompaniesController {
  constructor(private readonly listCompaniesUseCase: ListCompaniesUseCase) {}

  @Get()
  findAll() {
    return this.listCompaniesUseCase.execute()
  }
}
