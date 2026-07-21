export const REQUIREMENT_REPOSITORY = 'REQUIREMENT_REPOSITORY'

export type RequirementRecord = {
  id: number
  usageType: string
  budget: { toString(): string }
  priority: string
  deviceType: string
  createdAt: Date
}

export type CreateRequirementInput = {
  usageType: string
  budget: number
  priority: string
  deviceType: string
}

export interface RequirementRepository {
  findAll(): Promise<RequirementRecord[]>
  create(input: CreateRequirementInput): Promise<RequirementRecord>
}
