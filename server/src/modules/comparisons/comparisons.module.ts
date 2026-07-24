import { Module } from '@nestjs/common'
import { ListComparisonsUseCase } from './application/use-cases/list-comparisons.use-case'
import { CompareProductsUseCase } from './application/use-cases/compare-products.use-case'
import { COMPARISON_REPOSITORY } from './domain/repositories/comparison.repository'
import { PrismaComparisonRepository } from './infrastructure/prisma/prisma-comparison.repository'
import { ComparisonsController } from './presentation/controllers/comparisons.controller'
import { ProductsModule } from '../products/products.module'

@Module({
  imports: [ProductsModule],
  controllers: [ComparisonsController],
  providers: [
    ListComparisonsUseCase,
    CompareProductsUseCase,
    { provide: COMPARISON_REPOSITORY, useClass: PrismaComparisonRepository },
  ],
  exports: [COMPARISON_REPOSITORY],
})
export class ComparisonsModule {}
