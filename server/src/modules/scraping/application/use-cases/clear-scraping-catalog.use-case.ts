import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'

export type ClearCatalogResult = {
  productsDeleted: number
  pricesDeleted: number
  specsDeleted: number
  tagRelationsDeleted: number
  tagsDeleted: number
  comparisonsDeleted: number
  recommendationsDeleted: number
  historyDeleted: number
}

@Injectable()
export class ClearScrapingCatalogUseCase {
  private readonly logger = new Logger(ClearScrapingCatalogUseCase.name)

  constructor(private readonly prisma: PrismaService) {}

  async execute(input?: { clearProducts?: boolean; clearHistory?: boolean }): Promise<ClearCatalogResult> {
    const clearProducts = input?.clearProducts !== false
    const clearHistory = input?.clearHistory !== false

    const empty: ClearCatalogResult = {
      productsDeleted: 0,
      pricesDeleted: 0,
      specsDeleted: 0,
      tagRelationsDeleted: 0,
      tagsDeleted: 0,
      comparisonsDeleted: 0,
      recommendationsDeleted: 0,
      historyDeleted: 0,
    }

    if (!clearProducts && !clearHistory) return empty

    if (clearHistory) {
      const history = await this.prisma.scrapingHistory.deleteMany({})
      empty.historyDeleted = history.count
    }

    if (clearProducts) {
      // Orden explícito = mismas tablas del catálogo scrapeado (sin depender solo del cascade)
      const comparisons = await this.prisma.productComparison.deleteMany({})
      const recommendations = await this.prisma.recommendation.deleteMany({})
      const prices = await this.prisma.productPrice.deleteMany({})
      const specs = await this.prisma.productSpec.deleteMany({})
      const tagRelations = await this.prisma.productTagRelation.deleteMany({})
      const products = await this.prisma.product.deleteMany({})
      const tags = await this.prisma.productTag.deleteMany({})

      empty.comparisonsDeleted = comparisons.count
      empty.recommendationsDeleted = recommendations.count
      empty.pricesDeleted = prices.count
      empty.specsDeleted = specs.count
      empty.tagRelationsDeleted = tagRelations.count
      empty.productsDeleted = products.count
      empty.tagsDeleted = tags.count
    }

    this.logger.warn(`Clear catalog: ${JSON.stringify(empty)}`)
    return empty
  }
}
