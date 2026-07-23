import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient, UserRole, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

type StoreConfigMap = Record<
  string,
  {
    baseUrl: string
    [key: string]: unknown
  }
>

async function upsertStore(input: {
  slug: string
  name: string
  website: string
  scrapeConfig: Record<string, unknown>
}) {
  return prisma.company.upsert({
    where: { slug: input.slug },
    update: {
      name: input.name,
      website: input.website,
      active: true,
      scrapeConfig: input.scrapeConfig,
    },
    create: {
      slug: input.slug,
      name: input.name,
      website: input.website,
      active: true,
      scrapeConfig: input.scrapeConfig,
    },
  })
}

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
  const configPath = join(process.cwd(), 'fixtures', 'scraping', 'store-scrape-configs.json')
  const configs = JSON.parse(readFileSync(configPath, 'utf8')) as StoreConfigMap

  const admin = await upsertAdmin()

  await upsertStore({
    slug: 'demo-store',
    name: 'Demo Store',
    website: 'https://example.com',
    scrapeConfig: { baseUrl: 'https://example.com', notes: 'seed demo only' },
  })

  const memoryKings = await upsertStore({
    slug: 'memory-kings',
    name: 'Memory Kings',
    website: 'https://www.memorykings.pe/',
    scrapeConfig: configs['memory-kings'],
  })

  const sercoplus = await upsertStore({
    slug: 'sercoplus',
    name: 'Sercoplus',
    website: 'https://sercoplus.com/',
    scrapeConfig: configs.sercoplus,
  })

  const impacto = await upsertStore({
    slug: 'impacto',
    name: 'Impacto',
    website: 'https://www.impacto.com.pe/',
    scrapeConfig: configs.impacto,
  })

  console.log('Seed OK — admin:', admin.email, '/', admin.password)
  console.log('Seed OK — stores:')
  console.log('-', memoryKings.slug, memoryKings.id)
  console.log('-', sercoplus.slug, sercoplus.id, '(cloudflare blocked — config scaffold)')
  console.log('-', impacto.slug, impacto.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
