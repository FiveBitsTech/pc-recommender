import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import {
  UserAuthRecord,
  UserMeRecord,
  UserRepository,
} from '../../domain/repositories/user.repository'

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<UserAuthRecord | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
        role: true,
        status: true,
      },
    })
  }

  findById(id: number): Promise<UserMeRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    })
  }

  async updateLastLoginAt(id: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    })
  }
}
