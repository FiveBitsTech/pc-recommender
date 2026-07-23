import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  COMPANY_REPOSITORY,
  type CompanyRepository,
  type UpsertCompanyInput,
} from '../../domain/repositories/company.repository'
import { mapCompanyItem } from '../mappers/map-company-item'

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(id: number, input: Partial<UpsertCompanyInput>) {
    const company = await this.companyRepository.update(id, input)
    if (!company) throw new NotFoundException('Company not found')
    return mapCompanyItem(company)
  }
}
