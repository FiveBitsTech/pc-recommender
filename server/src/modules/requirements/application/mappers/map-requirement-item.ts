import { RequirementRecord } from '../../domain/repositories/requirement.repository'

export const mapRequirementItem = (requirement: RequirementRecord) => ({
  id: requirement.id,
  usageType: requirement.usageType,
  budget: Number(requirement.budget),
  priority: requirement.priority,
  deviceType: requirement.deviceType,
  createdAt: requirement.createdAt,
})
