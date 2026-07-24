import { Body, Controller, Get, Post } from '@nestjs/common'
import { ListComparisonsUseCase } from '../../application/use-cases/list-comparisons.use-case'
import { CompareProductsUseCase } from '../../application/use-cases/compare-products.use-case'
import { CompareProductsDto } from '../dto/compare-products.dto'

@Controller('comparisons')
export class ComparisonsController {
  constructor(
    private readonly listComparisonsUseCase: ListComparisonsUseCase,
    private readonly compareProductsUseCase: CompareProductsUseCase,
  ) {}

  @Get()
  findAll() {
    return this.listComparisonsUseCase.execute()
  }

  @Post('compare')
  compare(@Body() dto: CompareProductsDto) {
    return this.compareProductsUseCase.execute(dto.productOneId, dto.productTwoId)
  }
}
