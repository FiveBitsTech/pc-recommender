import { Module } from '@nestjs/common'
import { ListAllCompaniesUseCase } from './application/use-cases/list-all-companies.use-case'
import { ListCompaniesUseCase } from './application/use-cases/list-companies.use-case'
import { UpdateCompanyUseCase } from './application/use-cases/update-company.use-case'
import { UpsertCompanyUseCase } from './application/use-cases/upsert-company.use-case'
import { COMPANY_REPOSITORY } from './domain/repositories/company.repository'
import { PrismaCompanyRepository } from './infrastructure/prisma/prisma-company.repository'
import { CompaniesController } from './presentation/controllers/companies.controller'

@Module({
  controllers: [CompaniesController],
  providers: [
    ListCompaniesUseCase,
    ListAllCompaniesUseCase,
    UpsertCompanyUseCase,
    UpdateCompanyUseCase,
    { provide: COMPANY_REPOSITORY, useClass: PrismaCompanyRepository },
  ],
  exports: [COMPANY_REPOSITORY],
})
export class CompaniesModule {}
