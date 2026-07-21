import { Module } from '@nestjs/common'
import { CreateRequirementUseCase } from './application/use-cases/create-requirement.use-case'
import { ListRequirementsUseCase } from './application/use-cases/list-requirements.use-case'
import { REQUIREMENT_REPOSITORY } from './domain/repositories/requirement.repository'
import { PrismaRequirementRepository } from './infrastructure/prisma/prisma-requirement.repository'
import { RequirementsController } from './presentation/controllers/requirements.controller'

@Module({
  controllers: [RequirementsController],
  providers: [
    ListRequirementsUseCase,
    CreateRequirementUseCase,
    { provide: REQUIREMENT_REPOSITORY, useClass: PrismaRequirementRepository },
  ],
  exports: [REQUIREMENT_REPOSITORY],
})
export class RequirementsModule {}
