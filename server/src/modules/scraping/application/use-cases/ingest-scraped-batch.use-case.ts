import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import type { ScrapedBatch, ScrapedCompany, ScrapedProductItem } from '../../domain/ports/store-scraper.port'
import { normalizeTagName, projectSpecsToFlat } from '../mappers/project-specs'

const USD_TO_PEN = Number(process.env.USD_TO_PEN) || 3.75

@Injectable()
export class IngestScrapedBatchUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async upsertCompany(company: ScrapedCompany) {
    return this.prisma.company.upsert({
      where: { slug: company.slug },
      create: {
        slug: company.slug,
        name: company.name,
        website: company.website ?? null,
        logoUrl: company.logoUrl ?? null,
        active: true,
      },
      update: {
        name: company.name,
        website: company.website ?? null,
        logoUrl: company.logoUrl ?? null,
        active: true,
      },
    })
  }

  // Una sola conexión por ficha (BD remota: evita saturar el pool con N round-trips).
  async ingestProduct(companyId: number, item: ScrapedProductItem, fallbackDate?: string): Promise<boolean> {
    const productUrl = item.product.productUrl
    if (!productUrl) return false

    // Skip products with invalid prices (not real tech product prices)
    if (!item.price.price || item.price.price < 50) return false

    // Convert USD to PEN so all prices are stored in soles
    let finalPrice = item.price.price
    let finalCurrency = item.price.currency

    if (finalCurrency === 'USD') {
      finalPrice = Number((finalPrice * USD_TO_PEN).toFixed(2))
      finalCurrency = 'PEN'
    }

    const flat = projectSpecsToFlat(item.specs)
    const priceUpdatedAt = new Date(item.price.updatedAt || fallbackDate || Date.now())

    await this.prisma.$transaction(async tx => {
      const product = await tx.product.upsert({
        where: {
          companyId_productUrl: { companyId, productUrl },
        },
        create: {
          companyId,
          name: item.product.name,
          brand: item.product.brand ?? null,
          model: item.product.model ?? null,
          category: item.product.category ?? null,
          productUrl,
          imageUrl: item.product.imageUrl ?? null,
          externalSku: item.product.externalSku ?? null,
        },
        update: {
          name: item.product.name,
          brand: item.product.brand ?? null,
          model: item.product.model ?? null,
          category: item.product.category ?? null,
          imageUrl: item.product.imageUrl ?? null,
          externalSku: item.product.externalSku ?? null,
        },
      })

      await tx.productSpec.upsert({
        where: { productId: product.id },
        create: { productId: product.id, ...flat },
        update: flat,
      })

      await tx.productPrice.create({
        data: {
          productId: product.id,
          price: finalPrice,
          currency: finalCurrency,
          available: item.price.available ?? true,
          stockQty: item.price.stockQty ?? null,
          updatedAt: priceUpdatedAt,
        },
      })

      for (const rawTag of item.tags ?? []) {
        const name = normalizeTagName(rawTag)
        if (!name) continue
        const tag = await tx.productTag.upsert({
          where: { name },
          create: { name },
          update: {},
        })
        await tx.productTagRelation.upsert({
          where: {
            productId_tagId: { productId: product.id, tagId: tag.id },
          },
          create: { productId: product.id, tagId: tag.id },
          update: {},
        })
      }
    })

    return true
  }

  async execute(batch: ScrapedBatch) {
    const company = await this.upsertCompany(batch.company)

    let ingested = 0
    for (const item of batch.products) {
      if (await this.ingestProduct(company.id, item, batch.run.scrapedAt)) ingested += 1
    }

    return { companyId: company.id, productsIngested: ingested }
  }
}
