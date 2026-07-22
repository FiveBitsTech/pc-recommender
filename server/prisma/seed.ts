import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data (order matters due to FK constraints)
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

  console.log('🧹 Cleaned existing data')

  // --- COMPANIES ---
  const companies = await Promise.all([
    prisma.company.create({
      data: { name: 'Hiraoka', website: 'https://www.hiraoka.com.pe', logoUrl: 'https://www.hiraoka.com.pe/logo.png', active: true },
    }),
    prisma.company.create({
      data: { name: 'Saga Falabella', website: 'https://www.falabella.com.pe', logoUrl: 'https://www.falabella.com.pe/logo.png', active: true },
    }),
    prisma.company.create({
      data: { name: 'Ripley', website: 'https://simple.ripley.com.pe', logoUrl: 'https://simple.ripley.com.pe/logo.png', active: true },
    }),
    prisma.company.create({
      data: { name: 'PlazaVea', website: 'https://www.plazavea.com.pe', logoUrl: 'https://www.plazavea.com.pe/logo.png', active: true },
    }),
    prisma.company.create({
      data: { name: 'Coolbox', website: 'https://www.coolbox.pe', logoUrl: 'https://www.coolbox.pe/logo.png', active: true },
    }),
  ])

  const [hiraoka, falabella, ripley, plazavea, coolbox] = companies
  console.log(`✅ Created ${companies.length} companies`)

  // --- TAGS ---
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

  const [tGaming, tOficina, tDiseno, tEstudiante, tProgramacion, tUltrabook, tDesktop, tWorkstation, tPresupuesto, tPremium] = tags
  console.log(`✅ Created ${tags.length} tags`)

  // --- PRODUCTS (Laptops & PCs) ---
  const productsData = [
    // Hiraoka
    {
      companyId: hiraoka.id,
      name: 'Laptop Lenovo IdeaPad 3 15IAU7',
      brand: 'Lenovo',
      model: 'IdeaPad 3 15IAU7',
      category: 'laptop',
      productUrl: 'https://www.hiraoka.com.pe/laptop-lenovo-ideapad-3',
      imageUrl: 'https://www.hiraoka.com.pe/images/lenovo-ideapad-3.jpg',
      specs: { processor: 'Intel Core i5-1235U', gpu: 'Intel Iris Xe', ram: '8GB DDR4', storage: '512GB SSD NVMe', screen: '15.6" FHD IPS', operatingSystem: 'Windows 11 Home' },
      price: 2299.00,
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
      specs: { processor: 'AMD Ryzen 7 6800H', gpu: 'NVIDIA RTX 3050 4GB', ram: '16GB DDR5', storage: '512GB SSD NVMe', screen: '15.6" FHD 144Hz', operatingSystem: 'Windows 11 Home' },
      price: 4499.00,
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
      specs: { processor: 'Intel Core i5-12500', gpu: 'Intel UHD 770', ram: '8GB DDR4', storage: '256GB SSD', screen: 'N/A', operatingSystem: 'Windows 11 Pro' },
      price: 3199.00,
      tagIds: [tOficina.id, tDesktop.id],
    },
    // Falabella
    {
      companyId: falabella.id,
      name: 'MacBook Air M2 13"',
      brand: 'Apple',
      model: 'MacBook Air M2 2022',
      category: 'laptop',
      productUrl: 'https://www.falabella.com.pe/macbook-air-m2',
      imageUrl: 'https://www.falabella.com.pe/images/macbook-air-m2.jpg',
      specs: { processor: 'Apple M2 8-core', gpu: 'Apple M2 8-core GPU', ram: '8GB Unified', storage: '256GB SSD', screen: '13.6" Liquid Retina', operatingSystem: 'macOS Ventura' },
      price: 5499.00,
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
      specs: { processor: 'Intel Core i5-12450H', gpu: 'NVIDIA GTX 1650 4GB', ram: '8GB DDR4', storage: '512GB SSD NVMe', screen: '15.6" FHD IPS', operatingSystem: 'Windows 11 Home' },
      price: 3299.00,
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
      specs: { processor: 'Intel Core i7-1360P', gpu: 'Intel Iris Xe', ram: '16GB DDR5', storage: '512GB SSD NVMe', screen: '14" FHD+ IPS', operatingSystem: 'Windows 11 Home' },
      price: 4199.00,
      tagIds: [tProgramacion.id, tOficina.id, tUltrabook.id],
    },
    // Ripley
    {
      companyId: ripley.id,
      name: 'Laptop Acer Nitro 5 AN515',
      brand: 'Acer',
      model: 'Nitro 5 AN515-58',
      category: 'laptop',
      productUrl: 'https://simple.ripley.com.pe/laptop-acer-nitro-5',
      imageUrl: 'https://simple.ripley.com.pe/images/acer-nitro-5.jpg',
      specs: { processor: 'Intel Core i5-12500H', gpu: 'NVIDIA RTX 3060 6GB', ram: '16GB DDR4', storage: '512GB SSD NVMe', screen: '15.6" FHD 144Hz IPS', operatingSystem: 'Windows 11 Home' },
      price: 4799.00,
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
      specs: { processor: 'Intel Core i5-1155G7', gpu: 'Intel Iris Xe', ram: '8GB DDR4', storage: '512GB SSD NVMe', screen: '15.6" FHD IPS', operatingSystem: 'Windows 11 Home' },
      price: 2599.00,
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
      specs: { processor: 'Intel Core i7-12700', gpu: 'NVIDIA RTX 3070 8GB', ram: '16GB DDR5', storage: '1TB SSD NVMe', screen: 'N/A', operatingSystem: 'Windows 11 Home' },
      price: 6999.00,
      tagIds: [tGaming.id, tDesktop.id, tPremium.id],
    },
    // PlazaVea
    {
      companyId: plazavea.id,
      name: 'Laptop HP 250 G9',
      brand: 'HP',
      model: '250 G9',
      category: 'laptop',
      productUrl: 'https://www.plazavea.com.pe/laptop-hp-250-g9',
      imageUrl: 'https://www.plazavea.com.pe/images/hp-250-g9.jpg',
      specs: { processor: 'Intel Core i3-1215U', gpu: 'Intel UHD', ram: '4GB DDR4', storage: '256GB SSD', screen: '15.6" HD', operatingSystem: 'FreeDOS' },
      price: 1599.00,
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
      specs: { processor: 'Intel Core i5-1235U', gpu: 'Intel Iris Xe', ram: '8GB DDR4', storage: '256GB SSD', screen: '15.6" FHD', operatingSystem: 'Windows 11 Home' },
      price: 2199.00,
      tagIds: [tOficina.id, tEstudiante.id, tPresupuesto.id],
    },
    // Coolbox
    {
      companyId: coolbox.id,
      name: 'Laptop MSI Katana GF66 12UC',
      brand: 'MSI',
      model: 'Katana GF66 12UC',
      category: 'laptop',
      productUrl: 'https://www.coolbox.pe/laptop-msi-katana-gf66',
      imageUrl: 'https://www.coolbox.pe/images/msi-katana-gf66.jpg',
      specs: { processor: 'Intel Core i7-12700H', gpu: 'NVIDIA RTX 3050 4GB', ram: '16GB DDR4', storage: '512GB SSD NVMe', screen: '15.6" FHD 144Hz', operatingSystem: 'Windows 11 Home' },
      price: 4999.00,
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
      specs: { processor: 'AMD Ryzen 9 5900X', gpu: 'NVIDIA RTX 3080 10GB', ram: '32GB DDR4', storage: '1TB SSD NVMe + 2TB HDD', screen: 'N/A', operatingSystem: 'Windows 11 Pro' },
      price: 9499.00,
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
      specs: { processor: 'Intel Core i7-1260P', gpu: 'Intel Iris Xe', ram: '16GB LPDDR5', storage: '512GB SSD NVMe', screen: '14" 2.8K OLED 90Hz', operatingSystem: 'Windows 11 Home' },
      price: 5299.00,
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
      specs: { processor: 'Intel Core i5-1240P', gpu: 'Intel Iris Xe', ram: '8GB DDR4', storage: '256GB SSD NVMe', screen: '14" FHD IPS', operatingSystem: 'Windows 11 Pro' },
      price: 3599.00,
      tagIds: [tProgramacion.id, tOficina.id],
    },
  ]

  // Create products with specs, prices, and tags
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
      },
    })

    for (const tagId of p.tagIds) {
      await prisma.productTagRelation.create({
        data: { productId: product.id, tagId },
      })
    }

    createdProducts.push(product)
  }

  console.log(`✅ Created ${createdProducts.length} products with specs, prices, and tags`)

  // --- USER REQUIREMENTS ---
  const requirements = await Promise.all([
    prisma.userRequirement.create({
      data: { usageType: 'gaming', budget: 5000.00, priority: 'rendimiento', deviceType: 'laptop' },
    }),
    prisma.userRequirement.create({
      data: { usageType: 'oficina', budget: 2500.00, priority: 'precio', deviceType: 'laptop' },
    }),
    prisma.userRequirement.create({
      data: { usageType: 'diseño gráfico', budget: 7000.00, priority: 'pantalla', deviceType: 'laptop' },
    }),
    prisma.userRequirement.create({
      data: { usageType: 'programación', budget: 4500.00, priority: 'rendimiento', deviceType: 'laptop' },
    }),
    prisma.userRequirement.create({
      data: { usageType: 'gaming', budget: 10000.00, priority: 'rendimiento', deviceType: 'desktop' },
    }),
    prisma.userRequirement.create({
      data: { usageType: 'estudio', budget: 2000.00, priority: 'precio', deviceType: 'laptop' },
    }),
  ])

  console.log(`✅ Created ${requirements.length} user requirements`)

  // --- RECOMMENDATIONS ---
  // Req 0: gaming laptop, budget 5000
  await prisma.recommendation.createMany({
    data: [
      { requirementId: requirements[0].id, productId: createdProducts[1].id, score: 9.2, reason: 'Excelente laptop gaming con RTX 3050 y Ryzen 7, ideal para juegos AAA a FHD.' },
      { requirementId: requirements[0].id, productId: createdProducts[6].id, score: 9.5, reason: 'La RTX 3060 ofrece mejor rendimiento gaming. Ligeramente por debajo del presupuesto.' },
      { requirementId: requirements[0].id, productId: createdProducts[10].id, score: 8.8, reason: 'Buen rendimiento gaming con i7-12700H y RTX 3050, pantalla 144Hz.' },
    ],
  })

  // Req 1: oficina laptop, budget 2500
  await prisma.recommendation.createMany({
    data: [
      { requirementId: requirements[1].id, productId: createdProducts[0].id, score: 9.0, reason: 'Laptop ideal para oficina con i5 de 12va gen y buen almacenamiento, dentro del presupuesto.' },
      { requirementId: requirements[1].id, productId: createdProducts[7].id, score: 8.5, reason: 'Diseño ultrabook ligero y elegante para trabajo de oficina.' },
      { requirementId: requirements[1].id, productId: createdProducts[9].id, score: 8.7, reason: 'Buena relación precio-rendimiento para tareas de oficina.' },
    ],
  })

  // Req 2: diseño gráfico, budget 7000
  await prisma.recommendation.createMany({
    data: [
      { requirementId: requirements[2].id, productId: createdProducts[3].id, score: 9.3, reason: 'Pantalla Liquid Retina excepcional para diseño. Chip M2 optimizado para apps creativas.' },
      { requirementId: requirements[2].id, productId: createdProducts[12].id, score: 9.6, reason: 'Pantalla OLED 2.8K ideal para diseño gráfico con colores precisos y alto contraste.' },
    ],
  })

  // Req 3: programación, budget 4500
  await prisma.recommendation.createMany({
    data: [
      { requirementId: requirements[3].id, productId: createdProducts[5].id, score: 9.1, reason: '16GB RAM y i7-1360P excelentes para desarrollo. Pantalla 14" cómoda para código.' },
      { requirementId: requirements[3].id, productId: createdProducts[13].id, score: 8.9, reason: 'ThinkPad con excelente teclado para programar. Robusto y profesional.' },
      { requirementId: requirements[3].id, productId: createdProducts[1].id, score: 8.4, reason: '16GB DDR5 y Ryzen 7 ofrecen buen rendimiento para compilación y VMs.' },
    ],
  })

  // Req 4: gaming desktop, budget 10000
  await prisma.recommendation.createMany({
    data: [
      { requirementId: requirements[4].id, productId: createdProducts[8].id, score: 9.7, reason: 'RTX 3070 con i7-12700 ofrece rendimiento gaming excepcional en desktop.' },
      { requirementId: requirements[4].id, productId: createdProducts[11].id, score: 9.9, reason: 'RTX 3080 + Ryzen 9 5900X es la mejor combinación para gaming extremo y creación de contenido.' },
    ],
  })

  // Req 5: estudio, budget 2000
  await prisma.recommendation.createMany({
    data: [
      { requirementId: requirements[5].id, productId: createdProducts[8 - 1].id, score: 8.0, reason: 'Laptop básica muy económica para estudios universitarios.' },
      { requirementId: requirements[5].id, productId: createdProducts[9].id, score: 8.8, reason: 'Buen rendimiento para estudios con i5 y 8GB RAM, precio accesible.' },
    ],
  })

  console.log('✅ Created recommendations')

  // --- PRODUCT COMPARISONS ---
  await prisma.productComparison.createMany({
    data: [
      {
        productOneId: createdProducts[1].id, // ASUS ROG Strix
        productTwoId: createdProducts[6].id, // Acer Nitro 5
        analysis: 'Ambas son laptops gaming de gama media. El Acer Nitro 5 tiene ventaja con la RTX 3060 vs RTX 3050 del ROG Strix, pero el ROG Strix cuenta con DDR5 y mejor calidad de construcción. El Nitro 5 ofrece mejor relación precio-rendimiento en gaming puro.',
      },
      {
        productOneId: createdProducts[3].id, // MacBook Air M2
        productTwoId: createdProducts[12].id, // ASUS ZenBook 14 OLED
        analysis: 'El MacBook Air M2 destaca por su ecosistema y duración de batería excepcional. El ZenBook 14 OLED tiene mejor pantalla (2.8K OLED vs Liquid Retina) y mayor versatilidad con Windows. Para diseño, ambos son excelentes opciones premium.',
      },
      {
        productOneId: createdProducts[0].id, // Lenovo IdeaPad 3
        productTwoId: createdProducts[9].id, // Lenovo V15
        analysis: 'Ambas laptops Lenovo de presupuesto con procesadores similares (i5-1235U). La IdeaPad 3 tiene mejor almacenamiento (512GB vs 256GB). La V15 es más económica. Para estudiantes, la IdeaPad 3 ofrece mejor valor a largo plazo.',
      },
      {
        productOneId: createdProducts[8].id, // Legion Tower 5
        productTwoId: createdProducts[11].id, // PC Coolbox Ryzen Pro
        analysis: 'El Coolbox Ryzen Pro es superior en todo: Ryzen 9 vs i7-12700, RTX 3080 vs RTX 3070, y 32GB vs 16GB RAM. Sin embargo cuesta S/2500 más. El Legion Tower ofrece excelente rendimiento gaming a menor costo.',
      },
      {
        productOneId: createdProducts[10].id, // MSI Katana
        productTwoId: createdProducts[1].id, // ASUS ROG Strix
        analysis: 'Ambas con RTX 3050 4GB. La MSI Katana tiene ventaja en procesador (i7-12700H vs Ryzen 7 6800H en single-core). El ROG Strix tiene DDR5 y mejor sistema de refrigeración. Precios similares, el ROG Strix es mejor compra por la RAM DDR5.',
      },
    ],
  })

  console.log('✅ Created product comparisons')

  // --- SCRAPING HISTORY ---
  const now = new Date()
  await prisma.scrapingHistory.createMany({
    data: [
      { companyId: hiraoka.id, status: 'completed', productsFound: 3, executedAt: new Date(now.getTime() - 86400000 * 1) },
      { companyId: hiraoka.id, status: 'completed', productsFound: 3, executedAt: new Date(now.getTime() - 86400000 * 7) },
      { companyId: falabella.id, status: 'completed', productsFound: 3, executedAt: new Date(now.getTime() - 86400000 * 1) },
      { companyId: falabella.id, status: 'failed', productsFound: 0, executedAt: new Date(now.getTime() - 86400000 * 3) },
      { companyId: ripley.id, status: 'completed', productsFound: 3, executedAt: new Date(now.getTime() - 86400000 * 2) },
      { companyId: ripley.id, status: 'completed', productsFound: 2, executedAt: new Date(now.getTime() - 86400000 * 9) },
      { companyId: plazavea.id, status: 'completed', productsFound: 2, executedAt: new Date(now.getTime() - 86400000 * 1) },
      { companyId: plazavea.id, status: 'in_progress', productsFound: 0, executedAt: now },
      { companyId: coolbox.id, status: 'completed', productsFound: 4, executedAt: new Date(now.getTime() - 86400000 * 1) },
      { companyId: coolbox.id, status: 'completed', productsFound: 4, executedAt: new Date(now.getTime() - 86400000 * 5) },
    ],
  })

  console.log('✅ Created scraping history')
  console.log('\n🎉 Seed completed successfully!')
  console.log(`   📦 ${companies.length} companies`)
  console.log(`   🏷️  ${tags.length} tags`)
  console.log(`   💻 ${createdProducts.length} products (with specs, prices & tags)`)
  console.log(`   📋 ${requirements.length} user requirements`)
  console.log(`   ⭐ Recommendations, comparisons & scraping history created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
