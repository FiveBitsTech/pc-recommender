import { UserRole, UserStatus } from '@prisma/client'

export const USER_REPOSITORY = 'USER_REPOSITORY'

export type UserAuthRecord = {
  id: number
  email: string
  passwordHash: string
  name: string | null
  role: UserRole
  status: UserStatus
}

export type UserMeRecord = {
  id: number
  email: string
  name: string | null
  role: UserRole
  status: UserStatus
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserAuthRecord | null>
  findById(id: number): Promise<UserMeRecord | null>
  updateLastLoginAt(id: number): Promise<void>
}
