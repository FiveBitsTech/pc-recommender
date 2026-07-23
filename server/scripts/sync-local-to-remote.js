const { PrismaClient } = require('@prisma/client')

const localUrl =
  process.env.LOCAL_DATABASE_URL ||
  'postgresql://postgres:root@localhost:5432/pc_recommender?schema=public'
const remoteUrl = process.env.DATABASE_URL

if (!remoteUrl) {
  console.error('DATABASE_URL is required (remote)')
  process.exit(1)
}

async function dumpLocal() {
  const p = new PrismaClient({ datasources: { db: { url: localUrl } } })
  const companies = await p.$queryRawUnsafe(`
    SELECT id, slug, name, website, logo_url, active, scrape_config, created_at, updated_at
    FROM companies ORDER BY id`)
  const products = await p.$queryRawUnsafe(`
    SELECT p.*, c.slug as company_slug
    FROM products p JOIN companies c ON c.id = p.company_id
    ORDER BY p.id`)
  const specs = await p.$queryRawUnsafe(`
    SELECT s.*, c.slug as company_slug, p.product_url, p.name as product_name
    FROM product_specs s
    JOIN products p ON p.id = s.product_id
    JOIN companies c ON c.id = p.company_id`)
  const prices = await p.$queryRawUnsafe(`
    SELECT pr.*, c.slug as company_slug, p.product_url, p.name as product_name
    FROM product_prices pr
    JOIN products p ON p.id = pr.product_id
    JOIN companies c ON c.id = p.company_id
    ORDER BY pr.id`)
  const tags = await p.$queryRawUnsafe(`SELECT id, name FROM product_tags ORDER BY id`)
  const tagRels = await p.$queryRawUnsafe(`
    SELECT c.slug as company_slug, p.product_url, p.name as product_name, t.name as tag_name
    FROM product_tag_relations r
    JOIN products p ON p.id = r.product_id
    JOIN companies c ON c.id = p.company_id
    JOIN product_tags t ON t.id = r.tag_id`)
  const history = await p.$queryRawUnsafe(`
    SELECT h.*, c.slug as company_slug
    FROM scraping_history h
    JOIN companies c ON c.id = h.company_id
    ORDER BY h.id`)
  const users = await p.$queryRawUnsafe(`
    SELECT email, password_hash, name, role::text as role, status::text as status, last_login_at
    FROM users`)
  await p.$disconnect()
  return { companies, products, specs, prices, tags, tagRels, history, users }
}

async function sync() {
  const local = await dumpLocal()
  const remote = new PrismaClient({ datasources: { db: { url: remoteUrl } } })

  const report = {
    companiesUpserted: [],
    productsCreated: [],
    productsSkipped: [],
    pricesCreated: 0,
    tagsEnsured: 0,
    historyCreated: 0,
    scrapeConfigsUpdated: [],
    notes: [],
  }

  for (const c of local.companies) {
    const existing = await remote.company.findUnique({ where: { slug: c.slug } })
    if (!existing) {
      const created = await remote.company.create({
        data: {
          slug: c.slug,
          name: c.name,
          website: c.website,
          logoUrl: c.logo_url,
          active: c.active,
          scrapeConfig: c.scrape_config ?? undefined,
        },
      })
      report.companiesUpserted.push(`CREATED ${created.slug}#${created.id}`)
      continue
    }

    const updates = {}
    if (c.scrape_config) {
      const localJson = JSON.stringify(c.scrape_config)
      const remoteJson = JSON.stringify(existing.scrapeConfig)
      if (localJson !== remoteJson) {
        updates.scrapeConfig = c.scrape_config
        report.scrapeConfigsUpdated.push(c.slug)
      }
    }

    if (Object.keys(updates).length) {
      await remote.company.update({ where: { id: existing.id }, data: updates })
      report.companiesUpserted.push(`UPDATED ${existing.slug}#${existing.id}`)
    } else {
      report.companiesUpserted.push(`KEEP ${existing.slug}#${existing.id}`)
    }
  }

  const remoteCompanies = await remote.company.findMany()
  const companyIdBySlug = Object.fromEntries(remoteCompanies.map((c) => [c.slug, c.id]))

  for (const t of local.tags) {
    await remote.productTag.upsert({
      where: { name: t.name },
      update: {},
      create: { name: t.name },
    })
    report.tagsEnsured++
  }
  const remoteTags = await remote.productTag.findMany()
  const tagIdByName = Object.fromEntries(remoteTags.map((t) => [t.name, t.id]))

  for (const p of local.products) {
    const companyId = companyIdBySlug[p.company_slug]
    if (!companyId) {
      report.notes.push(`skip product ${p.name}: company ${p.company_slug} missing`)
      continue
    }

    let existing = null
    if (p.product_url) {
      existing = await remote.product.findFirst({
        where: { companyId, productUrl: p.product_url },
      })
    }
    if (!existing) {
      existing = await remote.product.findFirst({
        where: { companyId, name: p.name },
      })
    }
    if (existing) {
      report.productsSkipped.push(`${p.company_slug}:${p.name}`)
      continue
    }

    const created = await remote.product.create({
      data: {
        companyId,
        name: p.name,
        brand: p.brand,
        model: p.model,
        category: p.category,
        productUrl: p.product_url,
        imageUrl: p.image_url,
        externalSku: p.external_sku,
      },
    })
    report.productsCreated.push(`${p.company_slug}:${created.name}#${created.id}`)

    const spec = local.specs.find(
      (s) =>
        s.company_slug === p.company_slug &&
        (s.product_url === p.product_url || s.product_name === p.name),
    )
    if (spec) {
      await remote.productSpec.create({
        data: {
          productId: created.id,
          processor: spec.processor,
          gpu: spec.gpu,
          ram: spec.ram,
          storage: spec.storage,
          screen: spec.screen,
          operatingSystem: spec.operating_system,
        },
      })
    }

    const prices = local.prices.filter(
      (pr) =>
        pr.company_slug === p.company_slug &&
        (pr.product_url === p.product_url || pr.product_name === p.name),
    )
    for (const pr of prices) {
      await remote.productPrice.create({
        data: {
          productId: created.id,
          price: pr.price,
          currency: pr.currency || 'PEN',
          available: pr.available ?? true,
          stockQty: pr.stock_qty,
          updatedAt: pr.updated_at || new Date(),
        },
      })
      report.pricesCreated++
    }

    const rels = local.tagRels.filter(
      (r) =>
        r.company_slug === p.company_slug &&
        (r.product_url === p.product_url || r.product_name === p.name),
    )
    for (const r of rels) {
      const tagId = tagIdByName[r.tag_name]
      if (!tagId) continue
      try {
        await remote.productTagRelation.create({
          data: { productId: created.id, tagId },
        })
      } catch {
        // unique conflict ok
      }
    }
  }

  for (const h of local.history) {
    const companyId = companyIdBySlug[h.company_slug]
    if (!companyId) continue
    const day = new Date(h.executed_at)
    const dayStart = new Date(day)
    dayStart.setUTCHours(0, 0, 0, 0)
    const dayEnd = new Date(day)
    dayEnd.setUTCHours(23, 59, 59, 999)
    const exists = await remote.scrapingHistory.findFirst({
      where: {
        companyId,
        source: h.source,
        status: h.status,
        productsFound: h.products_found,
        executedAt: { gte: dayStart, lte: dayEnd },
      },
    })
    if (exists) continue
    await remote.scrapingHistory.create({
      data: {
        companyId,
        source: h.source,
        status: h.status,
        productsFound: h.products_found,
        errorMessage: h.error_message,
        executedAt: h.executed_at,
      },
    })
    report.historyCreated++
  }

  for (const u of local.users) {
    const existing = await remote.user.findUnique({ where: { email: u.email } })
    if (!existing) {
      await remote.user.create({
        data: {
          email: u.email,
          passwordHash: u.password_hash,
          name: u.name,
          role: u.role,
          status: u.status,
          lastLoginAt: u.last_login_at,
        },
      })
      report.notes.push(`created user ${u.email}`)
    } else {
      report.notes.push(`keep user ${u.email} (password not overwritten)`)
    }
  }

  const tables = ['users', 'companies', 'products', 'product_prices', 'scraping_history']
  const finalCounts = {}
  for (const t of tables) {
    const r = await remote.$queryRawUnsafe(`SELECT count(*)::int AS c FROM "${t}"`)
    finalCounts[t] = r[0].c
  }
  report.finalCounts = finalCounts

  await remote.$disconnect()
  console.log(JSON.stringify(report, null, 2))
}

sync().catch((e) => {
  console.error(e)
  process.exit(1)
})
