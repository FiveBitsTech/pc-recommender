import { CompanyRecord } from '../../domain/repositories/company.repository'

export const mapCompanyItem = (company: CompanyRecord) => ({
  id: company.id,
  slug: company.slug,
  name: company.name,
  website: company.website,
  logoUrl: company.logoUrl,
  active: company.active,
  scrapeConfig: company.scrapeConfig,
})
