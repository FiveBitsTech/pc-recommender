import { Controller, Get } from '@nestjs/common'
import { ListComparisonsUseCase } from '../../application/use-cases/list-comparisons.use-case'

@Controller('comparisons')
export class ComparisonsController {
  constructor(private readonly listComparisonsUseCase: ListComparisonsUseCase) {}

  @Get()
  findAll() {
    return this.listComparisonsUseCase.execute()
  }
}
