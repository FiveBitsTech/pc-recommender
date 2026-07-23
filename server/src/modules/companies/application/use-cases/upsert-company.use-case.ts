import { Inject, Injectable } from '@nestjs/common'
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
  type UpsertCompanyInput,
} from '../../domain/repositories/company.repository'
import { mapCompanyItem } from '../mappers/map-company-item'

@Injectable()
export class UpsertCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(input: UpsertCompanyInput) {
    const company = await this.companyRepository.upsertBySlug(input)
    return mapCompanyItem(company)
  }
}
