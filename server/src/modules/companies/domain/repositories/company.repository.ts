export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY'

export type CompanyRecord = {
  id: number
  name: string
  website: string | null
  logoUrl: string | null
  active: boolean
}

export interface CompanyRepository {
  findAllActive(): Promise<CompanyRecord[]>
  findById(id: number): Promise<CompanyRecord | null>
}
