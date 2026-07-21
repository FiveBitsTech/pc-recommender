import { Controller, Get } from '@nestjs/common'
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case'

@Controller('products')
export class ProductsController {
  constructor(private readonly listProductsUseCase: ListProductsUseCase) {}

  @Get()
  findAll() {
    return this.listProductsUseCase.execute()
  }
}
