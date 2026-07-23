import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import {
  CompanyRecord,
  CompanyRepository,
  UpsertCompanyInput,
} from '../../domain/repositories/company.repository'

const companySelect = {
  id: true,
  slug: true,
  name: true,
  website: true,
  logoUrl: true,
  active: true,
  scrapeConfig: true,
} as const

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllActive(): Promise<CompanyRecord[]> {
    return this.prisma.company.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: companySelect,
    })
  }

  findAll(): Promise<CompanyRecord[]> {
    return this.prisma.company.findMany({
      orderBy: { name: 'asc' },
      select: companySelect,
    })
  }

  findById(id: number): Promise<CompanyRecord | null> {
    return this.prisma.company.findUnique({
      where: { id },
      select: companySelect,
    })
  }

  upsertBySlug(input: UpsertCompanyInput): Promise<CompanyRecord> {
    const scrapeConfig =
      input.scrapeConfig === undefined
        ? undefined
        : (input.scrapeConfig as Prisma.InputJsonValue)

    return this.prisma.company.upsert({
      where: { slug: input.slug },
      create: {
        slug: input.slug,
        name: input.name,
        website: input.website ?? null,
        logoUrl: input.logoUrl ?? null,
        active: input.active ?? true,
        scrapeConfig: scrapeConfig ?? Prisma.JsonNull,
      },
      update: {
        name: input.name,
        website: input.website ?? null,
        logoUrl: input.logoUrl ?? null,
        active: input.active ?? true,
        ...(scrapeConfig !== undefined ? { scrapeConfig } : {}),
      },
      select: companySelect,
    })
  }

  async update(id: number, input: Partial<UpsertCompanyInput>): Promise<CompanyRecord> {
    const existing = await this.findById(id)
    if (!existing) throw new NotFoundException('Company not found')

    return this.prisma.company.update({
      where: { id },
      data: {
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.website !== undefined ? { website: input.website } : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
        ...(input.scrapeConfig !== undefined
          ? { scrapeConfig: input.scrapeConfig as Prisma.InputJsonValue }
          : {}),
      },
      select: companySelect,
    })
  }
}
