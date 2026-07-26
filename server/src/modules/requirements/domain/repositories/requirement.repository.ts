export const REQUIREMENT_REPOSITORY = 'REQUIREMENT_REPOSITORY'

export type RequirementRecord = {
  id: number
  usageType: string
  budget: { toString(): string }
  budgetMin: { toString(): string } | null
  priority: string
  deviceType: string
  brandPreference: string | null
  createdAt: Date
}

export type CreateRequirementInput = {
  usageType: string
  budget: number
  budgetMin?: number | null
  priority: string
  deviceType: string
  brandPreference?: string | null
}

export interface RequirementRepository {
  findAll(): Promise<RequirementRecord[]>
  findById(id: number): Promise<RequirementRecord | null>
  findRecent(limit: number): Promise<RequirementRecord[]>
  create(input: CreateRequirementInput): Promise<RequirementRecord>
}
