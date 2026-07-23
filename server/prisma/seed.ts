import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient, UserRole, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

type StoreConfigMap = Record<string, { baseUrl: string; [key: string]: unknown }>

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
  console.log('Seeding database...')

  const configPath = join(process.cwd(), 'fixtures', 'scraping', 'store-scrape-configs.json')
  const configs = JSON.parse(readFileSync(configPath, 'utf8')) as StoreConfigMap

  const admin = await upsertAdmin()
  console.log(`Admin ready: ${admin.email}`)

  // Clean catalog data (keep users)
  await prisma.productComparison.deleteMany()
  await prisma.recommendation.deleteMany()
  await prisma.userRequirement.deleteMany()
  await prisma.productTagRelation.deleteMany()
  await prisma.productTag.deleteMany()
  await prisma.productPrice.deleteMany()
  await prisma.productSpec.deleteMany()
  await prisma.scrapingHistory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.company.deleteMany()
  console.log('Cleaned catalog data')

  // Scraping-target stores (with scrapeConfig) + demo catalog stores
  const memoryKings = await prisma.company.create({
    data: {
      slug: 'memory-kings',
      name: 'Memory Kings',
      website: 'https://www.memorykings.pe/',
      active: true,
      scrape_config: configs['memory-kings'],
    },
  })
  const sercoplus = await prisma.company.create({
    data: {
      slug: 'sercoplus',
      name: 'Sercoplus',
      website: 'https://sercoplus.com/',
      active: true,
      scrape_config: configs.sercoplus,
    },
  })
  const impacto = await prisma.company.create({
    data: {
      slug: 'impacto',
      name: 'Impacto',
      website: 'https://www.impacto.com.pe/',
      active: true,
      scrape_config: configs.impacto,
    },
  })

  const companies = await Promise.all([
    prisma.company.create({
      data: {
        slug: 'hiraoka',
        name: 'Hiraoka',
        website: 'https://www.hiraoka.com.pe',
        logoUrl: 'https://www.hiraoka.com.pe/logo.png',
        active: true,
      },
    }),
    prisma.company.create({
      data: {
        slug: 'saga-falabella',
        name: 'Saga Falabella',
        website: 'https://www.falabella.com.pe',
        logoUrl: 'https://www.falabella.com.pe/logo.png',
        active: true,
      },
    }),
    prisma.company.create({
      data: {
        slug: 'ripley',
        name: 'Ripley',
        website: 'https://simple.ripley.com.pe',
        logoUrl: 'https://simple.ripley.com.pe/logo.png',
        active: true,
      },
    }),
    prisma.company.create({
      data: {
        slug: 'plazavea',
        name: 'PlazaVea',
        website: 'https://www.plazavea.com.pe',
        logoUrl: 'https://www.plazavea.com.pe/logo.png',
        active: true,
      },
    }),
    prisma.company.create({
      data: {
        slug: 'coolbox',
        name: 'Coolbox',
        website: 'https://www.coolbox.pe',
        logoUrl: 'https://www.coolbox.pe/logo.png',
        active: true,
      },
    }),
  ])

  const [hiraoka, falabella, ripley, plazavea, coolbox] = companies
  console.log(
    `Created ${companies.length + 3} companies (incl. memory-kings/sercoplus/impacto)`,
  )

  const tags = await Promise.all([
    prisma.productTag.create({ data: { name: 'gaming' } }),
    prisma.productTag.create({ data: { name: 'oficina' } }),
    prisma.productTag.create({ data: { name: 'diseño' } }),
    prisma.productTag.create({ data: { name: 'estudiante' } }),
    prisma.productTag.create({ data: { name: 'programación' } }),
    prisma.productTag.create({ data: { name: 'ultrabook' } }),
    prisma.productTag.create({ data: { name: 'desktop' } }),
    prisma.productTag.create({ data: { name: 'workstation' } }),
    prisma.productTag.create({ data: { name: 'presupuesto' } }),
    prisma.productTag.create({ data: { name: 'premium' } }),
  ])

  const [
    tGaming,
    tOficina,
    tDiseno,
    tEstudiante,
    tProgramacion,
    tUltrabook,
    tDesktop,
    tWorkstation,
    tPresupuesto,
    tPremium,
  ] = tags
  console.log(`Created ${tags.length} tags`)

  const productsData = [
    {
      companyId: hiraoka.id,
      name: 'Laptop Lenovo IdeaPad 3 15IAU7',
      brand: 'Lenovo',
      model: 'IdeaPad 3 15IAU7',
      category: 'laptop',
      productUrl: 'https://www.hiraoka.com.pe/laptop-lenovo-ideapad-3',
      imageUrl: 'https://www.hiraoka.com.pe/images/lenovo-ideapad-3.jpg',
      specs: {
        processor: 'Intel Core i5-1235U',
        gpu: 'Intel Iris Xe',
        ram: '8GB DDR4',
        storage: '512GB SSD NVMe',
        screen: '15.6" FHD IPS',
        operatingSystem: 'Windows 11 Home',
      },
      price: 2299.0,
      tagIds: [tEstudiante.id, tOficina.id, tPresupuesto.id],
    },
    {
      companyId: hiraoka.id,
      name: 'Laptop ASUS ROG Strix G15',
      brand: 'ASUS',
      model: 'ROG Strix G15 G513RC',
      category: 'laptop',
      productUrl: 'https://www.hiraoka.com.pe/laptop-asus-rog-strix-g15',
      imageUrl: 'https://www.hiraoka.com.pe/images/asus-rog-strix.jpg',
      specs: {
        processor: 'AMD Ryzen 7 6800H',
        gpu: 'NVIDIA RTX 3050 4GB',
        ram: '16GB DDR5',
        storage: '512GB SSD NVMe',
        screen: '15.6" FHD 144Hz',
        operatingSystem: 'Windows 11 Home',
      },
      price: 4499.0,
      tagIds: [tGaming.id, tProgramacion.id],
    },
    {
      companyId: hiraoka.id,
      name: 'PC Desktop HP ProDesk 400 G9',
      brand: 'HP',
      model: 'ProDesk 400 G9 SFF',
      category: 'desktop',
      productUrl: 'https://www.hiraoka.com.pe/pc-hp-prodesk-400',
      imageUrl: 'https://www.hiraoka.com.pe/images/hp-prodesk-400.jpg',
      specs: {
        processor: 'Intel Core i5-12500',
        gpu: 'Intel UHD 770',
        ram: '8GB DDR4',
        storage: '256GB SSD',
        screen: 'N/A',
        operatingSystem: 'Windows 11 Pro',
      },
      price: 3199.0,
      tagIds: [tOficina.id, tDesktop.id],
    },
    {
      companyId: falabella.id,
      name: 'MacBook Air M2 13"',
      brand: 'Apple',
      model: 'MacBook Air M2 2022',
      category: 'laptop',
      productUrl: 'https://www.falabella.com.pe/macbook-air-m2',
      imageUrl: 'https://www.falabella.com.pe/images/macbook-air-m2.jpg',
      specs: {
        processor: 'Apple M2 8-core',
        gpu: 'Apple M2 8-core GPU',
        ram: '8GB Unified',
        storage: '256GB SSD',
        screen: '13.6" Liquid Retina',
        operatingSystem: 'macOS Ventura',
      },
      price: 5499.0,
      tagIds: [tUltrabook.id, tDiseno.id, tPremium.id],
    },
    {
      companyId: falabella.id,
      name: 'Laptop HP Victus 15',
      brand: 'HP',
      model: 'Victus 15-fa0031dx',
      category: 'laptop',
      productUrl: 'https://www.falabella.com.pe/laptop-hp-victus-15',
      imageUrl: 'https://www.falabella.com.pe/images/hp-victus-15.jpg',
      specs: {
        processor: 'Intel Core i5-12450H',
        gpu: 'NVIDIA GTX 1650 4GB',
        ram: '8GB DDR4',
        storage: '512GB SSD NVMe',
        screen: '15.6" FHD IPS',
        operatingSystem: 'Windows 11 Home',
      },
      price: 3299.0,
      tagIds: [tGaming.id, tEstudiante.id, tPresupuesto.id],
    },
    {
      companyId: falabella.id,
      name: 'Laptop Dell Inspiron 14 5430',
      brand: 'Dell',
      model: 'Inspiron 14 5430',
      category: 'laptop',
      productUrl: 'https://www.falabella.com.pe/laptop-dell-inspiron-14',
      imageUrl: 'https://www.falabella.com.pe/images/dell-inspiron-14.jpg',
      specs: {
        processor: 'Intel Core i7-1360P',
        gpu: 'Intel Iris Xe',
        ram: '16GB DDR5',
        storage: '512GB SSD NVMe',
        screen: '14" FHD+ IPS',
        operatingSystem: 'Windows 11 Home',
      },
      price: 4199.0,
      tagIds: [tProgramacion.id, tOficina.id, tUltrabook.id],
    },
    {
      companyId: ripley.id,
      name: 'Laptop Acer Nitro 5 AN515',
      brand: 'Acer',
      model: 'Nitro 5 AN515-58',
      category: 'laptop',
      productUrl: 'https://simple.ripley.com.pe/laptop-acer-nitro-5',
      imageUrl: 'https://simple.ripley.com.pe/images/acer-nitro-5.jpg',
      specs: {
        processor: 'Intel Core i5-12500H',
        gpu: 'NVIDIA RTX 3060 6GB',
        ram: '16GB DDR4',
        storage: '512GB SSD NVMe',
        screen: '15.6" FHD 144Hz IPS',
        operatingSystem: 'Windows 11 Home',
      },
      price: 4799.0,
      tagIds: [tGaming.id, tProgramacion.id, tPremium.id],
    },
    {
      companyId: ripley.id,
      name: 'Laptop Huawei MateBook D15',
      brand: 'Huawei',
      model: 'MateBook D15 2023',
      category: 'laptop',
      productUrl: 'https://simple.ripley.com.pe/laptop-huawei-matebook-d15',
      imageUrl: 'https://simple.ripley.com.pe/images/huawei-matebook-d15.jpg',
      specs: {
        processor: 'Intel Core i5-1155G7',
        gpu: 'Intel Iris Xe',
        ram: '8GB DDR4',
        storage: '512GB SSD NVMe',
        screen: '15.6" FHD IPS',
        operatingSystem: 'Windows 11 Home',
      },
      price: 2599.0,
      tagIds: [tOficina.id, tEstudiante.id, tUltrabook.id],
    },
    {
      companyId: ripley.id,
      name: 'PC Gamer Lenovo Legion Tower 5',
      brand: 'Lenovo',
      model: 'Legion Tower 5 26IAB7',
      category: 'desktop',
      productUrl: 'https://simple.ripley.com.pe/pc-lenovo-legion-tower',
      imageUrl: 'https://simple.ripley.com.pe/images/lenovo-legion-tower.jpg',
      specs: {
        processor: 'Intel Core i7-12700',
        gpu: 'NVIDIA RTX 3070 8GB',
        ram: '16GB DDR5',
        storage: '1TB SSD NVMe',
        screen: 'N/A',
        operatingSystem: 'Windows 11 Home',
      },
      price: 6999.0,
      tagIds: [tGaming.id, tDesktop.id, tPremium.id],
    },
    {
      companyId: plazavea.id,
      name: 'Laptop HP 250 G9',
      brand: 'HP',
      model: '250 G9',
      category: 'laptop',
      productUrl: 'https://www.plazavea.com.pe/laptop-hp-250-g9',
      imageUrl: 'https://www.plazavea.com.pe/images/hp-250-g9.jpg',
      specs: {
        processor: 'Intel Core i3-1215U',
        gpu: 'Intel UHD',
        ram: '4GB DDR4',
        storage: '256GB SSD',
        screen: '15.6" HD',
        operatingSystem: 'FreeDOS',
      },
      price: 1599.0,
      tagIds: [tPresupuesto.id, tEstudiante.id],
    },
    {
      companyId: plazavea.id,
      name: 'Laptop Lenovo V15 G3 IAP',
      brand: 'Lenovo',
      model: 'V15 G3 IAP',
      category: 'laptop',
      productUrl: 'https://www.plazavea.com.pe/laptop-lenovo-v15',
      imageUrl: 'https://www.plazavea.com.pe/images/lenovo-v15.jpg',
      specs: {
        processor: 'Intel Core i5-1235U',
        gpu: 'Intel Iris Xe',
        ram: '8GB DDR4',
        storage: '256GB SSD',
        screen: '15.6" FHD',
        operatingSystem: 'Windows 11 Home',
      },
      price: 2199.0,
      tagIds: [tOficina.id, tEstudiante.id, tPresupuesto.id],
    },
    {
      companyId: coolbox.id,
      name: 'Laptop MSI Katana GF66 12UC',
      brand: 'MSI',
      model: 'Katana GF66 12UC',
      category: 'laptop',
      productUrl: 'https://www.coolbox.pe/laptop-msi-katana-gf66',
      imageUrl: 'https://www.coolbox.pe/images/msi-katana-gf66.jpg',
      specs: {
        processor: 'Intel Core i7-12700H',
        gpu: 'NVIDIA RTX 3050 4GB',
        ram: '16GB DDR4',
        storage: '512GB SSD NVMe',
        screen: '15.6" FHD 144Hz',
        operatingSystem: 'Windows 11 Home',
      },
      price: 4999.0,
      tagIds: [tGaming.id, tProgramacion.id],
    },
    {
      companyId: coolbox.id,
      name: 'PC Armada Coolbox Ryzen Pro',
      brand: 'Coolbox Custom',
      model: 'Ryzen Pro Workstation',
      category: 'desktop',
      productUrl: 'https://www.coolbox.pe/pc-armada-ryzen-pro',
      imageUrl: 'https://www.coolbox.pe/images/pc-ryzen-pro.jpg',
      specs: {
        processor: 'AMD Ryzen 9 5900X',
        gpu: 'NVIDIA RTX 3080 10GB',
        ram: '32GB DDR4',
        storage: '1TB SSD NVMe + 2TB HDD',
        screen: 'N/A',
        operatingSystem: 'Windows 11 Pro',
      },
      price: 9499.0,
      tagIds: [tWorkstation.id, tDesktop.id, tPremium.id, tDiseno.id],
    },
    {
      companyId: coolbox.id,
      name: 'Laptop ASUS ZenBook 14 OLED',
      brand: 'ASUS',
      model: 'ZenBook 14 OLED UX3402',
      category: 'laptop',
      productUrl: 'https://www.coolbox.pe/laptop-asus-zenbook-14-oled',
      imageUrl: 'https://www.coolbox.pe/images/asus-zenbook-14-oled.jpg',
      specs: {
        processor: 'Intel Core i7-1260P',
        gpu: 'Intel Iris Xe',
        ram: '16GB LPDDR5',
        storage: '512GB SSD NVMe',
        screen: '14" 2.8K OLED 90Hz',
        operatingSystem: 'Windows 11 Home',
      },
      price: 5299.0,
      tagIds: [tUltrabook.id, tDiseno.id, tProgramacion.id, tPremium.id],
    },
    {
      companyId: coolbox.id,
      name: 'Laptop Lenovo ThinkPad E14 Gen 4',
      brand: 'Lenovo',
      model: 'ThinkPad E14 Gen 4',
      category: 'laptop',
      productUrl: 'https://www.coolbox.pe/laptop-lenovo-thinkpad-e14',
      imageUrl: 'https://www.coolbox.pe/images/lenovo-thinkpad-e14.jpg',
      specs: {
        processor: 'Intel Core i5-1240P',
        gpu: 'Intel Iris Xe',
        ram: '8GB DDR4',
        storage: '256GB SSD NVMe',
        screen: '14" FHD IPS',
        operatingSystem: 'Windows 11 Pro',
      },
      price: 3599.0,
      tagIds: [tProgramacion.id, tOficina.id],
    },
  ]

  const createdProducts = []
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        companyId: p.companyId,
        name: p.name,
        brand: p.brand,
        model: p.model,
        category: p.category,
        productUrl: p.productUrl,
        imageUrl: p.imageUrl,
      },
    })

    await prisma.productSpec.create({
      data: {
        productId: product.id,
        processor: p.specs.processor,
        gpu: p.specs.gpu,
        ram: p.specs.ram,
        storage: p.specs.storage,
        screen: p.specs.screen,
        operatingSystem: p.specs.operatingSystem,
      },
    })

    await prisma.productPrice.create({
      data: {
        productId: product.id,
        price: p.price,
        currency: 'PEN',
        available: true,
      },
    })

    for (const tagId of p.tagIds) {
      await prisma.productTagRelation.create({
        data: { productId: product.id, tagId },
      })
    }

    createdProducts.push(product)
  }

  console.log(`Created ${createdProducts.length} products`)

  const requirements = await Promise.all([
    prisma.userRequirement.create({
      data: { usageType: 'gaming', budget: 5000.0, priority: 'rendimiento', deviceType: 'laptop' },
    }),
    prisma.userRequirement.create({
      data: { usageType: 'oficina', budget: 2500.0, priority: 'precio', deviceType: 'laptop' },
    }),
    prisma.userRequirement.create({
      data: {
        usageType: 'diseño gráfico',
        budget: 7000.0,
        priority: 'pantalla',
        deviceType: 'laptop',
      },
    }),
    prisma.userRequirement.create({
      data: {
        usageType: 'programación',
        budget: 4500.0,
        priority: 'rendimiento',
        deviceType: 'laptop',
      },
    }),
    prisma.userRequirement.create({
      data: {
        usageType: 'gaming',
        budget: 10000.0,
        priority: 'rendimiento',
        deviceType: 'desktop',
      },
    }),
    prisma.userRequirement.create({
      data: { usageType: 'estudio', budget: 2000.0, priority: 'precio', deviceType: 'laptop' },
    }),
  ])

  await prisma.recommendation.createMany({
    data: [
      {
        requirementId: requirements[0].id,
        productId: createdProducts[1].id,
        score: 9.2,
        reason: 'Excelente laptop gaming con RTX 3050 y Ryzen 7.',
      },
      {
        requirementId: requirements[0].id,
        productId: createdProducts[6].id,
        score: 9.5,
        reason: 'La RTX 3060 ofrece mejor rendimiento gaming.',
      },
      {
        requirementId: requirements[1].id,
        productId: createdProducts[0].id,
        score: 9.0,
        reason: 'Ideal para oficina, dentro del presupuesto.',
      },
      {
        requirementId: requirements[2].id,
        productId: createdProducts[3].id,
        score: 9.3,
        reason: 'Pantalla Liquid Retina excepcional para diseño.',
      },
      {
        requirementId: requirements[3].id,
        productId: createdProducts[5].id,
        score: 9.1,
        reason: '16GB RAM e i7 ideales para desarrollo.',
      },
      {
        requirementId: requirements[4].id,
        productId: createdProducts[11].id,
        score: 9.9,
        reason: 'RTX 3080 + Ryzen 9 para gaming extremo.',
      },
      {
        requirementId: requirements[5].id,
        productId: createdProducts[9].id,
        score: 8.0,
        reason: 'Opción económica para estudios.',
      },
    ],
  })

  await prisma.productComparison.createMany({
    data: [
      {
        productOneId: createdProducts[1].id,
        productTwoId: createdProducts[6].id,
        analysis: 'Ambas gaming gama media; Nitro 5 gana en GPU, ROG Strix en RAM DDR5.',
      },
      {
        productOneId: createdProducts[3].id,
        productTwoId: createdProducts[12].id,
        analysis: 'MacBook vs ZenBook OLED: ecosistema vs pantalla y versatilidad Windows.',
      },
    ],
  })

  const now = new Date()
  await prisma.scrapingHistory.createMany({
    data: [
      {
        companyId: hiraoka.id,
        source: 'seed',
        status: 'completed',
        productsFound: 3,
        executedAt: new Date(now.getTime() - 86400000),
      },
      {
        companyId: falabella.id,
        source: 'seed',
        status: 'completed',
        productsFound: 3,
        executedAt: new Date(now.getTime() - 86400000),
      },
      {
        companyId: impacto.id,
        source: 'impacto',
        status: 'success',
        productsFound: 0,
        executedAt: now,
      },
      {
        companyId: memoryKings.id,
        source: 'memory-kings',
        status: 'success',
        productsFound: 0,
        executedAt: now,
      },
      {
        companyId: sercoplus.id,
        source: 'sercoplus',
        status: 'failed',
        productsFound: 0,
        error_message: 'Cloudflare challenge — selectors pending',
        executedAt: now,
      },
      {
        companyId: coolbox.id,
        source: 'seed',
        status: 'completed',
        productsFound: 4,
        executedAt: new Date(now.getTime() - 86400000),
      },
    ],
  })

  console.log('Seed completed')
  console.log(`Admin: ${admin.email} / ${admin.password}`)
  console.log(`Companies: ${companies.length + 3}`)
  console.log(`Products: ${createdProducts.length}`)
  console.log(`Requirements: ${requirements.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
