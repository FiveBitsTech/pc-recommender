export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY'

export type CompanyRecord = {
  id: number
  slug: string
  name: string
  website: string | null
  logoUrl: string | null
  logoDarkBg: boolean
  logoBgColor: string | null
  active: boolean
  scrapeConfig: unknown
}

export type UpsertCompanyInput = {
  slug: string
  name: string
  website?: string | null
  logoUrl?: string | null
  logoDarkBg?: boolean
  logoBgColor?: string | null
  active?: boolean
  scrapeConfig?: unknown
}

export interface CompanyRepository {
  findAllActive(): Promise<CompanyRecord[]>
  findAll(): Promise<CompanyRecord[]>
  findById(id: number): Promise<CompanyRecord | null>
  upsertBySlug(input: UpsertCompanyInput): Promise<CompanyRecord>
  update(id: number, input: Partial<UpsertCompanyInput>): Promise<CompanyRecord>
}
