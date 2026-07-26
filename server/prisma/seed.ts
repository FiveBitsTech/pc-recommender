import { PrismaClient, UserRole, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

/**
 * Seed mínimo: solo admin.
 * Empresas y catálogo NO se siembran — se crean en la UI (dominio + scrapeConfig IA)
 * y se llenan con scraping.
 */
async function upsertAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@pc-cotiza.local').toLowerCase()
  const password = process.env.ADMIN_PASSWORD ?? 'Admin123!'
  const passwordHash = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      name: 'Administrador',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email,
      passwordHash,
      name: 'Administrador',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  })

  return { email: admin.email, password }
}

async function main() {
  console.log('Seeding (admin only)...')
  const admin = await upsertAdmin()
  console.log(`Admin ready: ${admin.email} / ${admin.password}`)
  console.log('Empresas/catálogo: no se siembran (crear en UI + scrapear).')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
