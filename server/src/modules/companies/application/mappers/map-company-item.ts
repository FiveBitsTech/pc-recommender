import { CompanyRecord } from '../../domain/repositories/company.repository'

export const mapCompanyItem = (company: CompanyRecord) => ({
  id: company.id,
  slug: company.slug,
  name: company.name,
  website: company.website,
  logoUrl: company.logoUrl,
  logoDarkBg: company.logoDarkBg,
  logoBgColor: company.logoBgColor,
  active: company.active,
  scrapeConfig: company.scrapeConfig,
})
