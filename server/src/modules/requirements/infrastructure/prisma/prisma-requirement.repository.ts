import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import {
  CreateRequirementInput,
  RequirementRecord,
  RequirementRepository,
} from '../../domain/repositories/requirement.repository'

@Injectable()
export class PrismaRequirementRepository implements RequirementRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<RequirementRecord[]> {
    return this.prisma.userRequirement.findMany({ orderBy: { id: 'desc' } })
  }

  create(input: CreateRequirementInput): Promise<RequirementRecord> {
    return this.prisma.userRequirement.create({
      data: {
        usageType: input.usageType,
        budget: input.budget,
        priority: input.priority,
        deviceType: input.deviceType,
      },
    })
  }
}
