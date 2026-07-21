import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.company.findFirst({ where: { name: 'Demo Store' } })
  const company =
    existing ??
    (await prisma.company.create({
      data: {
        name: 'Demo Store',
        website: 'https://example.com',
        active: true,
      },
    }))

  console.log('Seed OK — company:', company.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
