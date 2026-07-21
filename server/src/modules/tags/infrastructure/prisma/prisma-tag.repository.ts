import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import { TagRecord, TagRepository } from '../../domain/repositories/tag.repository'

@Injectable()
export class PrismaTagRepository implements TagRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<TagRecord[]> {
    return this.prisma.productTag.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
  }
}
