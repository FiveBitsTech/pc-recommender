import { Module } from '@nestjs/common'
import { ListComparisonsUseCase } from './application/use-cases/list-comparisons.use-case'
import { COMPARISON_REPOSITORY } from './domain/repositories/comparison.repository'
import { PrismaComparisonRepository } from './infrastructure/prisma/prisma-comparison.repository'
import { ComparisonsController } from './presentation/controllers/comparisons.controller'

@Module({
  controllers: [ComparisonsController],
  providers: [
    ListComparisonsUseCase,
    { provide: COMPARISON_REPOSITORY, useClass: PrismaComparisonRepository },
  ],
  exports: [COMPARISON_REPOSITORY],
})
export class ComparisonsModule {}
