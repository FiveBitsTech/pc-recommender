import { Module } from '@nestjs/common'
import { ListRecommendationsByRequirementUseCase } from './application/use-cases/list-recommendations-by-requirement.use-case'
import { RECOMMENDATION_REPOSITORY } from './domain/repositories/recommendation.repository'
import { PrismaRecommendationRepository } from './infrastructure/prisma/prisma-recommendation.repository'
import { RecommendationsController } from './presentation/controllers/recommendations.controller'
import { RequirementsModule } from '../requirements/requirements.module'
import { ProductsModule } from '../products/products.module'

@Module({
  imports: [RequirementsModule, ProductsModule],
  controllers: [RecommendationsController],
  providers: [
    ListRecommendationsByRequirementUseCase,
    { provide: RECOMMENDATION_REPOSITORY, useClass: PrismaRecommendationRepository },
  ],
  exports: [RECOMMENDATION_REPOSITORY],
})
export class RecommendationsModule {}
