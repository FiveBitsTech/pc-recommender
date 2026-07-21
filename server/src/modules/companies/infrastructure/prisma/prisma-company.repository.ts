import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import { CompanyRecord, CompanyRepository } from '../../domain/repositories/company.repository'

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllActive(): Promise<CompanyRecord[]> {
    return this.prisma.company.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, website: true, logoUrl: true, active: true },
    })
  }

  findById(id: number): Promise<CompanyRecord | null> {
    return this.prisma.company.findUnique({
      where: { id },
      select: { id: true, name: true, website: true, logoUrl: true, active: true },
    })
  }
}
