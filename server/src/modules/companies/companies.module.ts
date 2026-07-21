import { Module } from '@nestjs/common'
import { ListCompaniesUseCase } from './application/use-cases/list-companies.use-case'
import { COMPANY_REPOSITORY } from './domain/repositories/company.repository'
import { PrismaCompanyRepository } from './infrastructure/prisma/prisma-company.repository'
import { CompaniesController } from './presentation/controllers/companies.controller'

@Module({
  controllers: [CompaniesController],
  providers: [
    ListCompaniesUseCase,
    { provide: COMPANY_REPOSITORY, useClass: PrismaCompanyRepository },
  ],
  exports: [COMPANY_REPOSITORY],
})
export class CompaniesModule {}
