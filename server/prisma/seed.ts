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
      scrapeConfig: configs['memory-kings'],
    },
  })
  const sercoplus = await prisma.company.create({
    data: {
      slug: 'sercoplus',
      name: 'Sercoplus',
      website: 'https://sercoplus.com/',
      active: true,
      scrapeConfig: configs.sercoplus,
    },
  })
  const impacto = await prisma.company.create({
    data: {
      slug: 'impacto',
      name: 'Impacto',
      website: 'https://www.impacto.com.pe/',
      active: true,
      scrapeConfig: configs.impacto,
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

  // --- INDIVIDUAL COMPONENTS (for PC Builder) ---
  const componentsData = [
    // Procesadores
    { companyId: memoryKings.id, name: 'Procesador AMD Ryzen 5 5600X', brand: 'AMD', model: 'Ryzen 5 5600X', category: 'procesador', productUrl: 'https://www.memorykings.pe/ryzen-5-5600x', imageUrl: null, price: 649.00, tagIds: [tGaming.id] },
    { companyId: memoryKings.id, name: 'Procesador AMD Ryzen 7 5700X', brand: 'AMD', model: 'Ryzen 7 5700X', category: 'procesador', productUrl: 'https://www.memorykings.pe/ryzen-7-5700x', imageUrl: null, price: 899.00, tagIds: [tGaming.id, tProgramacion.id] },
    { companyId: memoryKings.id, name: 'Procesador AMD Ryzen 9 5900X', brand: 'AMD', model: 'Ryzen 9 5900X', category: 'procesador', productUrl: 'https://www.memorykings.pe/ryzen-9-5900x', imageUrl: null, price: 1399.00, tagIds: [tWorkstation.id, tPremium.id] },
    { companyId: impacto.id, name: 'Procesador Intel Core i5-12400F', brand: 'Intel', model: 'Core i5-12400F', category: 'procesador', productUrl: 'https://www.impacto.com.pe/i5-12400f', imageUrl: null, price: 599.00, tagIds: [tGaming.id, tPresupuesto.id] },
    { companyId: impacto.id, name: 'Procesador Intel Core i5-13600KF', brand: 'Intel', model: 'Core i5-13600KF', category: 'procesador', productUrl: 'https://www.impacto.com.pe/i5-13600kf', imageUrl: null, price: 1099.00, tagIds: [tGaming.id, tProgramacion.id] },
    { companyId: sercoplus.id, name: 'Procesador Intel Core i7-13700K', brand: 'Intel', model: 'Core i7-13700K', category: 'procesador', productUrl: 'https://sercoplus.com/i7-13700k', imageUrl: null, price: 1599.00, tagIds: [tWorkstation.id, tPremium.id] },
    // Placas madre
    { companyId: memoryKings.id, name: 'Placa Madre ASUS B550M-A WiFi', brand: 'ASUS', model: 'PRIME B550M-A WiFi', category: 'placa madre', productUrl: 'https://www.memorykings.pe/asus-b550m-a', imageUrl: null, price: 389.00, tagIds: [tGaming.id] },
    { companyId: memoryKings.id, name: 'Placa Madre MSI B550 GAMING GEN3', brand: 'MSI', model: 'B550 GAMING GEN3', category: 'placa madre', productUrl: 'https://www.memorykings.pe/msi-b550-gaming', imageUrl: null, price: 449.00, tagIds: [tGaming.id] },
    { companyId: impacto.id, name: 'Placa Madre Gigabyte B660M DS3H', brand: 'Gigabyte', model: 'B660M DS3H DDR4', category: 'placa madre', productUrl: 'https://www.impacto.com.pe/gigabyte-b660m', imageUrl: null, price: 359.00, tagIds: [tPresupuesto.id] },
    { companyId: impacto.id, name: 'Placa Madre MSI PRO Z690-A', brand: 'MSI', model: 'PRO Z690-A DDR4', category: 'placa madre', productUrl: 'https://www.impacto.com.pe/msi-z690-a', imageUrl: null, price: 699.00, tagIds: [tPremium.id] },
    // RAM
    { companyId: memoryKings.id, name: 'Memoria RAM Kingston Fury Beast 16GB DDR4 3200MHz', brand: 'Kingston', model: 'Fury Beast 16GB', category: 'ram', productUrl: 'https://www.memorykings.pe/kingston-fury-16gb', imageUrl: null, price: 179.00, tagIds: [tGaming.id, tPresupuesto.id] },
    { companyId: memoryKings.id, name: 'Memoria RAM Kingston Fury Beast 32GB (2x16) DDR4 3200MHz', brand: 'Kingston', model: 'Fury Beast 32GB Kit', category: 'ram', productUrl: 'https://www.memorykings.pe/kingston-fury-32gb', imageUrl: null, price: 339.00, tagIds: [tWorkstation.id, tProgramacion.id] },
    { companyId: sercoplus.id, name: 'Memoria RAM Corsair Vengeance 16GB DDR5 5600MHz', brand: 'Corsair', model: 'Vengeance DDR5 16GB', category: 'ram', productUrl: 'https://sercoplus.com/corsair-ddr5-16gb', imageUrl: null, price: 289.00, tagIds: [tPremium.id] },
    { companyId: sercoplus.id, name: 'Memoria RAM Corsair Vengeance 32GB (2x16) DDR5 5600MHz', brand: 'Corsair', model: 'Vengeance DDR5 32GB Kit', category: 'ram', productUrl: 'https://sercoplus.com/corsair-ddr5-32gb', imageUrl: null, price: 529.00, tagIds: [tPremium.id, tWorkstation.id] },
    // Tarjetas gráficas
    { companyId: memoryKings.id, name: 'Tarjeta Gráfica MSI GeForce RTX 4060 Ventus 2X 8GB', brand: 'MSI', model: 'RTX 4060 Ventus 2X', category: 'gpu', productUrl: 'https://www.memorykings.pe/msi-rtx4060', imageUrl: null, price: 1349.00, tagIds: [tGaming.id] },
    { companyId: memoryKings.id, name: 'Tarjeta Gráfica ASUS Dual RTX 4070 OC 12GB', brand: 'ASUS', model: 'Dual RTX 4070 OC', category: 'gpu', productUrl: 'https://www.memorykings.pe/asus-rtx4070', imageUrl: null, price: 2499.00, tagIds: [tGaming.id, tPremium.id] },
    { companyId: impacto.id, name: 'Tarjeta Gráfica Gigabyte RTX 4060 Ti Eagle 8GB', brand: 'Gigabyte', model: 'RTX 4060 Ti Eagle', category: 'gpu', productUrl: 'https://www.impacto.com.pe/gigabyte-rtx4060ti', imageUrl: null, price: 1799.00, tagIds: [tGaming.id] },
    { companyId: sercoplus.id, name: 'Tarjeta Gráfica EVGA RTX 3060 XC 12GB', brand: 'EVGA', model: 'RTX 3060 XC Gaming', category: 'gpu', productUrl: 'https://sercoplus.com/evga-rtx3060', imageUrl: null, price: 1149.00, tagIds: [tGaming.id, tPresupuesto.id] },
    // SSD
    { companyId: memoryKings.id, name: 'SSD Kingston NV2 1TB NVMe M.2', brand: 'Kingston', model: 'NV2 1TB', category: 'ssd', productUrl: 'https://www.memorykings.pe/kingston-nv2-1tb', imageUrl: null, price: 219.00, tagIds: [tPresupuesto.id] },
    { companyId: memoryKings.id, name: 'SSD Samsung 980 PRO 1TB NVMe M.2', brand: 'Samsung', model: '980 PRO 1TB', category: 'ssd', productUrl: 'https://www.memorykings.pe/samsung-980pro-1tb', imageUrl: null, price: 449.00, tagIds: [tPremium.id] },
    { companyId: impacto.id, name: 'SSD WD Black SN770 500GB NVMe M.2', brand: 'Western Digital', model: 'SN770 500GB', category: 'ssd', productUrl: 'https://www.impacto.com.pe/wd-sn770-500gb', imageUrl: null, price: 179.00, tagIds: [tPresupuesto.id] },
    { companyId: impacto.id, name: 'SSD WD Black SN770 1TB NVMe M.2', brand: 'Western Digital', model: 'SN770 1TB', category: 'ssd', productUrl: 'https://www.impacto.com.pe/wd-sn770-1tb', imageUrl: null, price: 289.00, tagIds: [] },
    // Fuentes de poder
    { companyId: memoryKings.id, name: 'Fuente de Poder EVGA 600W 80+ Bronze', brand: 'EVGA', model: '600 BR', category: 'fuente', productUrl: 'https://www.memorykings.pe/evga-600br', imageUrl: null, price: 219.00, tagIds: [tPresupuesto.id] },
    { companyId: memoryKings.id, name: 'Fuente de Poder Corsair RM750 80+ Gold', brand: 'Corsair', model: 'RM750', category: 'fuente', productUrl: 'https://www.memorykings.pe/corsair-rm750', imageUrl: null, price: 399.00, tagIds: [tPremium.id] },
    { companyId: impacto.id, name: 'Fuente de Poder Seasonic Focus GX-650 80+ Gold', brand: 'Seasonic', model: 'Focus GX-650', category: 'fuente', productUrl: 'https://www.impacto.com.pe/seasonic-gx650', imageUrl: null, price: 359.00, tagIds: [tGaming.id] },
    // Cases
    { companyId: memoryKings.id, name: 'Case Cougar MX330-G Air Mid Tower', brand: 'Cougar', model: 'MX330-G Air', category: 'case', productUrl: 'https://www.memorykings.pe/cougar-mx330g', imageUrl: null, price: 169.00, tagIds: [tPresupuesto.id] },
    { companyId: impacto.id, name: 'Case NZXT H5 Flow Mid Tower', brand: 'NZXT', model: 'H5 Flow', category: 'case', productUrl: 'https://www.impacto.com.pe/nzxt-h5-flow', imageUrl: null, price: 399.00, tagIds: [tPremium.id] },
    { companyId: sercoplus.id, name: 'Case Cooler Master MasterBox TD500 Mesh', brand: 'Cooler Master', model: 'TD500 Mesh', category: 'case', productUrl: 'https://sercoplus.com/cm-td500', imageUrl: null, price: 329.00, tagIds: [tGaming.id] },
  ]

  for (const c of componentsData) {
    const product = await prisma.product.create({
      data: {
        companyId: c.companyId,
        name: c.name,
        brand: c.brand,
        model: c.model,
        category: c.category,
        productUrl: c.productUrl,
        imageUrl: c.imageUrl,
      },
    })

    await prisma.productPrice.create({
      data: {
        productId: product.id,
        price: c.price,
        currency: 'PEN',
        available: true,
      },
    })

    for (const tagId of c.tagIds) {
      await prisma.productTagRelation.create({
        data: { productId: product.id, tagId },
      })
    }
  }

  console.log(`Created ${componentsData.length} individual components`)

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

  // --- RECOMMENDATIONS: 3 per requirement (Económica / Recomendada / Mejor opción) ---

  // Req 0: gaming + laptop + 5000 + rendimiento
  await prisma.recommendation.createMany({
    data: [
      {
        requirementId: requirements[0].id,
        productId: createdProducts[4].id, // HP Victus 15 — S/3299
        score: 7.8,
        reason: 'Opción económica con GTX 1650. Suficiente para gaming casual y juegos en ajustes medios. Gran relación calidad-precio como entrada al gaming.',
      },
      {
        requirementId: requirements[0].id,
        productId: createdProducts[1].id, // ASUS ROG Strix — S/4499
        score: 9.2,
        reason: 'Mejor equilibrio entre rendimiento y precio. Ryzen 7 6800H + RTX 3050 + 16GB DDR5 permite gaming fluido en FHD y buena multitarea. Recomendada por su RAM DDR5 que asegura futuro.',
      },
      {
        requirementId: requirements[0].id,
        productId: createdProducts[6].id, // Acer Nitro 5 — S/4799
        score: 9.5,
        reason: 'Mejor rendimiento gaming del rango. La RTX 3060 6GB supera significativamente a la 3050 en juegos AAA. Pantalla 144Hz IPS ideal para gaming competitivo.',
      },
    ],
  })

  // Req 1: oficina + laptop + 2500 + precio
  await prisma.recommendation.createMany({
    data: [
      {
        requirementId: requirements[1].id,
        productId: createdProducts[10].id, // Lenovo V15 — S/2199
        score: 8.2,
        reason: 'La opción más económica que cumple con tareas de oficina. i5 + 8GB RAM es suficiente para documentos, hojas de cálculo y navegación. Buen precio.',
      },
      {
        requirementId: requirements[1].id,
        productId: createdProducts[0].id, // Lenovo IdeaPad 3 — S/2299
        score: 9.0,
        reason: 'Mejor relación precio-rendimiento para oficina. Misma generación de procesador pero con 512GB SSD (el doble de almacenamiento). Ideal para uso diario prolongado.',
      },
      {
        requirementId: requirements[1].id,
        productId: createdProducts[7].id, // Huawei MateBook D15 — S/2599
        score: 8.5,
        reason: 'Diseño premium y ligero para llevar a reuniones. Pantalla FHD IPS con buenos ángulos de visión. Ligeramente sobre presupuesto pero ofrece mejor portabilidad.',
      },
    ],
  })

  // Req 2: diseño gráfico + laptop + 7000 + pantalla
  await prisma.recommendation.createMany({
    data: [
      {
        requirementId: requirements[2].id,
        productId: createdProducts[5].id, // Dell Inspiron 14 — S/4199
        score: 7.5,
        reason: 'Opción económica para diseño básico. i7 + 16GB DDR5 manejan Photoshop y diseño vectorial bien. Pantalla FHD+ IPS aceptable para trabajo de color.',
      },
      {
        requirementId: requirements[2].id,
        productId: createdProducts[13].id, // ASUS ZenBook 14 OLED — S/5299
        score: 9.6,
        reason: 'Pantalla OLED 2.8K con cobertura DCI-P3 del 100%. Colores precisos y contraste infinito ideales para diseño gráfico profesional. i7 + 16GB LPDDR5 para flujo creativo sin interrupciones.',
      },
      {
        requirementId: requirements[2].id,
        productId: createdProducts[3].id, // MacBook Air M2 — S/5499
        score: 9.3,
        reason: 'Pantalla Liquid Retina excepcional. Chip M2 optimizado para apps creativas de Adobe y Affinity. Mejor batería del mercado (18h). Ecosistema Apple es ventaja si ya usas iPhone/iPad.',
      },
    ],
  })

  // Req 3: programación + laptop + 4500 + rendimiento
  await prisma.recommendation.createMany({
    data: [
      {
        requirementId: requirements[3].id,
        productId: createdProducts[14].id, // ThinkPad E14 — S/3599
        score: 8.0,
        reason: 'Opción económica con teclado ThinkPad legendario para programar todo el día. i5-1240P suficiente para IDEs y Docker básico. Windows 11 Pro incluido.',
      },
      {
        requirementId: requirements[3].id,
        productId: createdProducts[5].id, // Dell Inspiron 14 — S/4199
        score: 9.1,
        reason: 'Mejor equilibrio para desarrollo. i7-1360P + 16GB DDR5 manejan múltiples IDEs, Docker, y máquinas virtuales sin problemas. Pantalla 14" FHD+ cómoda para leer código.',
      },
      {
        requirementId: requirements[3].id,
        productId: createdProducts[1].id, // ASUS ROG Strix — S/4499
        score: 8.4,
        reason: 'Máximo rendimiento del rango. Ryzen 7 + 16GB DDR5 + 512GB NVMe compilan rápido. La RTX 3050 ayuda en tareas de ML básico. Pantalla 15.6" si prefieres más espacio visual.',
      },
    ],
  })

  // Req 4: gaming + desktop + 10000 + rendimiento
  await prisma.recommendation.createMany({
    data: [
      {
        requirementId: requirements[4].id,
        productId: createdProducts[8].id, // Legion Tower 5 — S/6999
        score: 9.0,
        reason: 'Excelente desktop gaming sin gastar todo el presupuesto. i7-12700 + RTX 3070 corren cualquier juego actual en Ultra a 1440p. Sobra presupuesto para monitor gaming.',
      },
      {
        requirementId: requirements[4].id,
        productId: createdProducts[12].id, // PC Coolbox Ryzen Pro — S/9499
        score: 9.9,
        reason: 'Bestia absoluta. RTX 3080 + Ryzen 9 5900X + 32GB RAM es la combinación definitiva para gaming 4K y creación de contenido. Futuro asegurado por 4-5 años sin upgrades.',
      },
      {
        requirementId: requirements[4].id,
        productId: createdProducts[2].id, // HP ProDesk 400 — S/3199
        score: 6.5,
        reason: 'Opción ultra-económica si solo juegas títulos livianos o eSports. i5-12500 con UHD 770 maneja League of Legends y Valorant a buen FPS. Ideal si priorizas productividad sobre gaming.',
      },
    ],
  })

  // Req 5: estudio + laptop + 2000 + precio
  await prisma.recommendation.createMany({
    data: [
      {
        requirementId: requirements[5].id,
        productId: createdProducts[9].id, // HP 250 G9 — S/1599
        score: 7.5,
        reason: 'La más económica. i3 + 4GB RAM es suficiente para documentos, presentaciones y navegación web. Sin Windows incluido (puedes instalar Linux gratis).',
      },
      {
        requirementId: requirements[5].id,
        productId: createdProducts[10].id, // Lenovo V15 — S/2199
        score: 8.8,
        reason: 'Mejor opción para estudios. i5 + 8GB RAM + Windows 11 incluido. Maneja clases en Zoom, Office completo, y navegación pesada sin lag.',
      },
      {
        requirementId: requirements[5].id,
        productId: createdProducts[0].id, // Lenovo IdeaPad 3 — S/2299
        score: 8.3,
        reason: 'Ligeramente sobre presupuesto pero con 512GB SSD (el doble). Si guardas muchos archivos de la universidad, vale la inversión extra.',
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
        errorMessage: 'Cloudflare challenge — selectors pending',
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
