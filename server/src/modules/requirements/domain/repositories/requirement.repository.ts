export const REQUIREMENT_REPOSITORY = 'REQUIREMENT_REPOSITORY'

export type RequirementRecord = {
  id: number
  usageType: string
  budget: { toString(): string }
  priority: string
  deviceType: string
  brandPreference: string | null
  createdAt: Date
}

export type CreateRequirementInput = {
  usageType: string
  budget: number
  priority: string
  deviceType: string
  brandPreference?: string | null
}

export interface RequirementRepository {
  findAll(): Promise<RequirementRecord[]>
  findById(id: number): Promise<RequirementRecord | null>
  create(input: CreateRequirementInput): Promise<RequirementRecord>
}
