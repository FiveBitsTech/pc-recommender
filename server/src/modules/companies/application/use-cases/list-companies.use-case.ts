import { Inject, Injectable } from '@nestjs/common'
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
} from '../../domain/repositories/company.repository'
import { mapCompanyItem } from '../mappers/map-company-item'

@Injectable()
export class ListCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
  ) {}

  async execute() {
    const companies = await this.companyRepository.findAllActive()
    return { items: companies.map(mapCompanyItem) }
  }
}
