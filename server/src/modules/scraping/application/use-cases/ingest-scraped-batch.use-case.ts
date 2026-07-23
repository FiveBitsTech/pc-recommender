import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import type { ScrapedBatch } from '../../domain/ports/store-scraper.port'
import { normalizeTagName, projectSpecsToFlat } from '../mappers/project-specs'

@Injectable()
export class IngestScrapedBatchUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(batch: ScrapedBatch) {
    const company = await this.prisma.company.upsert({
      where: { slug: batch.company.slug },
      create: {
        slug: batch.company.slug,
        name: batch.company.name,
        website: batch.company.website ?? null,
        logoUrl: batch.company.logoUrl ?? null,
        active: true,
      },
      update: {
        name: batch.company.name,
        website: batch.company.website ?? null,
        logoUrl: batch.company.logoUrl ?? null,
        active: true,
      },
    })

    let ingested = 0

    for (const item of batch.products) {
      const productUrl = item.product.productUrl
      if (!productUrl) continue

      const product = await this.prisma.product.upsert({
        where: {
          companyId_productUrl: {
            companyId: company.id,
            productUrl,
          },
        },
        create: {
          companyId: company.id,
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

      const flat = projectSpecsToFlat(item.specs)
      await this.prisma.productSpec.upsert({
        where: { productId: product.id },
        create: { productId: product.id, ...flat },
        update: flat,
      })

      await this.prisma.productPrice.create({
        data: {
          productId: product.id,
          price: item.price.price,
          currency: item.price.currency || 'PEN',
          available: item.price.available ?? true,
          stockQty: item.price.stockQty ?? null,
          updatedAt: new Date(item.price.updatedAt || batch.run.scrapedAt),
        },
      })

      for (const rawTag of item.tags ?? []) {
        const name = normalizeTagName(rawTag)
        if (!name) continue
        const tag = await this.prisma.productTag.upsert({
          where: { name },
          create: { name },
          update: {},
        })
        await this.prisma.productTagRelation.upsert({
          where: {
            productId_tagId: { productId: product.id, tagId: tag.id },
          },
          create: { productId: product.id, tagId: tag.id },
          update: {},
        })
      }

      ingested += 1
    }

    return { companyId: company.id, productsIngested: ingested }
  }
}
