import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { normalizeAdminPage } from '../../domain/admin-page'
import type { AdminPageParams, AdminPageResult } from '../../domain/admin-page'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import {
  AdminComparisonRow,
  AdminPriceRow,
  AdminRecommendationRow,
  AdminSpecRow,
  ProductAdminItem,
  ProductAdminListParams,
  ProductFilterParams,
  ProductListItem,
  ProductRepository,
  ProductTagItem,
  ProductUpdateInput,
} from '../../domain/repositories/product.repository'

const listInclude = {
  specs: true,
  prices: { orderBy: { updatedAt: 'desc' as const }, take: 1 },
}

const adminListInclude = {
  specs: true,
  // Solo el precio vigente: el historial completo se carga en detalle / tab Precios.
  prices: { orderBy: { updatedAt: 'desc' as const }, take: 1 },
  company: { select: { id: true, name: true, slug: true } },
  tagRelations: { include: { tag: true } },
}

const adminDetailInclude = {
  specs: true,
  prices: { orderBy: { updatedAt: 'desc' as const }, take: 50 },
  company: { select: { id: true, name: true, slug: true } },
  tagRelations: { include: { tag: true } },
}

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProductListItem[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { id: 'desc' },
      include: {
        company: { select: { id: true, name: true, logoUrl: true } },
        specs: true,
        prices: { orderBy: { updatedAt: 'desc' }, take: 1 },
      },
    })

    return products.map((p) => this.toListItem(p))
  }

  async findById(id: number): Promise<ProductListItem | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, logoUrl: true } },
        specs: true,
        prices: { orderBy: { updatedAt: 'desc' }, take: 1 },
      },
    })

    return product ? this.toListItem(product) : null
  }

  async findByFilters(filters: ProductFilterParams): Promise<ProductListItem[]> {
    const products = await this.prisma.product.findMany({
      where: {
        category: filters.category,
        prices: {
          some: {
            price: { lte: filters.maxPrice },
          },
        },
      },
      orderBy: { id: 'desc' },
      take: filters.limit ?? 5,
      include: {
        specs: true,
        prices: { orderBy: { updatedAt: 'desc' }, take: 1 },
      },
    })
    return products.map((p) => this.toListItem(p))
  }

  async findAdminAll(params?: ProductAdminListParams): Promise<AdminPageResult<ProductAdminItem>> {
    const q = params?.q?.trim()
    const where: Prisma.ProductWhereInput = {}
    const { page, pageSize, skip, take } = normalizeAdminPage(params)

    if (params?.companyId) where.companyId = params.companyId
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { externalSku: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take,
        include: adminListInclude,
      }),
    ])

    return {
      items: products.map((p) => this.toAdminItem(p)),
      total,
      page,
      pageSize,
    }
  }

  async findAdminById(id: number): Promise<ProductAdminItem | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: adminDetailInclude,
    })
    return product ? this.toAdminItem(product) : null
  }

  async updateAdmin(id: number, data: ProductUpdateInput): Promise<ProductAdminItem | null> {
    const existing = await this.prisma.product.findUnique({ where: { id } })
    if (!existing) return null

    await this.prisma.$transaction(async (tx) => {
      const productData: Prisma.ProductUpdateInput = {}
      if (data.name !== undefined) productData.name = data.name
      if (data.brand !== undefined) productData.brand = data.brand
      if (data.model !== undefined) productData.model = data.model
      if (data.category !== undefined) productData.category = data.category
      if (data.productUrl !== undefined) productData.productUrl = data.productUrl
      if (data.imageUrl !== undefined) productData.imageUrl = data.imageUrl
      if (data.externalSku !== undefined) productData.externalSku = data.externalSku

      if (Object.keys(productData).length > 0) {
        await tx.product.update({ where: { id }, data: productData })
      }

      if (data.specs !== undefined) {
        if (data.specs === null) {
          await tx.productSpec.deleteMany({ where: { productId: id } })
        } else {
          await tx.productSpec.upsert({
            where: { productId: id },
            create: {
              productId: id,
              processor: data.specs.processor ?? null,
              gpu: data.specs.gpu ?? null,
              ram: data.specs.ram ?? null,
              storage: data.specs.storage ?? null,
              screen: data.specs.screen ?? null,
              operatingSystem: data.specs.operatingSystem ?? null,
            },
            update: {
              ...(data.specs.processor !== undefined && { processor: data.specs.processor }),
              ...(data.specs.gpu !== undefined && { gpu: data.specs.gpu }),
              ...(data.specs.ram !== undefined && { ram: data.specs.ram }),
              ...(data.specs.storage !== undefined && { storage: data.specs.storage }),
              ...(data.specs.screen !== undefined && { screen: data.specs.screen }),
              ...(data.specs.operatingSystem !== undefined && {
                operatingSystem: data.specs.operatingSystem,
              }),
            },
          })
        }
      }
    })

    return this.findAdminById(id)
  }

  async deleteById(id: number): Promise<boolean> {
    const existing = await this.prisma.product.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return false
    await this.prisma.product.delete({ where: { id } })
    return true
  }

  async listTags(params?: AdminPageParams): Promise<AdminPageResult<ProductTagItem>> {
    const q = params?.q?.trim()
    const { page, pageSize, skip, take } = normalizeAdminPage(params)
    const where: Prisma.ProductTagWhereInput = q
      ? { name: { contains: q, mode: 'insensitive' } }
      : {}

    const [total, tags] = await this.prisma.$transaction([
      this.prisma.productTag.count({ where }),
      this.prisma.productTag.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take,
        include: { _count: { select: { relations: true } } },
      }),
    ])

    return {
      items: tags.map((t) => ({
        id: t.id,
        name: t.name,
        productCount: t._count.relations,
        createdAt: t.createdAt,
      })),
      total,
      page,
      pageSize,
    }
  }

  async deleteTagById(id: number): Promise<boolean> {
    const existing = await this.prisma.productTag.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return false
    await this.prisma.productTag.delete({ where: { id } })
    return true
  }

  async listAdminPrices(params?: AdminPageParams): Promise<AdminPageResult<AdminPriceRow>> {
    const q = params?.q?.trim()
    const { page, pageSize, skip, take } = normalizeAdminPage(params)
    const where: Prisma.ProductPriceWhereInput = {}

    if (params?.companyId) where.product = { companyId: params.companyId }
    if (q) {
      where.OR = [
        { product: { name: { contains: q, mode: 'insensitive' } } },
        { product: { company: { name: { contains: q, mode: 'insensitive' } } } },
      ]
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.productPrice.count({ where }),
      this.prisma.productPrice.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              company: { select: { name: true } },
            },
          },
        },
      }),
    ])

    return {
      items: rows.map((r) => ({
        id: r.id,
        productId: r.productId,
        productName: r.product.name,
        companyName: r.product.company.name,
        price: r.price,
        currency: r.currency,
        available: r.available,
        stockQty: r.stockQty,
        updatedAt: r.updatedAt,
      })),
      total,
      page,
      pageSize,
    }
  }

  async listAdminSpecs(params?: AdminPageParams): Promise<AdminPageResult<AdminSpecRow>> {
    const q = params?.q?.trim()
    const { page, pageSize, skip, take } = normalizeAdminPage(params)
    const where: Prisma.ProductSpecWhereInput = {}

    if (params?.companyId) where.product = { companyId: params.companyId }
    if (q) {
      where.OR = [
        { product: { name: { contains: q, mode: 'insensitive' } } },
        { product: { company: { name: { contains: q, mode: 'insensitive' } } } },
        { processor: { contains: q, mode: 'insensitive' } },
        { gpu: { contains: q, mode: 'insensitive' } },
        { ram: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.productSpec.count({ where }),
      this.prisma.productSpec.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              company: { select: { name: true } },
            },
          },
        },
      }),
    ])

    return {
      items: rows.map((r) => ({
        id: r.id,
        productId: r.productId,
        productName: r.product.name,
        companyName: r.product.company.name,
        processor: r.processor,
        gpu: r.gpu,
        ram: r.ram,
        storage: r.storage,
        screen: r.screen,
        operatingSystem: r.operatingSystem,
      })),
      total,
      page,
      pageSize,
    }
  }

  async listAdminComparisons(params?: AdminPageParams): Promise<AdminPageResult<AdminComparisonRow>> {
    const q = params?.q?.trim()
    const { page, pageSize, skip, take } = normalizeAdminPage(params)
    const where: Prisma.ProductComparisonWhereInput = q
      ? {
          OR: [
            { productOne: { name: { contains: q, mode: 'insensitive' } } },
            { productTwo: { name: { contains: q, mode: 'insensitive' } } },
            { analysis: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.productComparison.count({ where }),
      this.prisma.productComparison.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take,
        include: {
          productOne: { select: { id: true, name: true } },
          productTwo: { select: { id: true, name: true } },
        },
      }),
    ])

    return {
      items: rows.map((r) => ({
        id: r.id,
        productOneId: r.productOneId,
        productOneName: r.productOne.name,
        productTwoId: r.productTwoId,
        productTwoName: r.productTwo.name,
        analysis: r.analysis,
        createdAt: r.createdAt,
      })),
      total,
      page,
      pageSize,
    }
  }

  async deleteComparisonById(id: number): Promise<boolean> {
    const existing = await this.prisma.productComparison.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!existing) return false
    await this.prisma.productComparison.delete({ where: { id } })
    return true
  }

  async listAdminRecommendations(
    params?: AdminPageParams,
  ): Promise<AdminPageResult<AdminRecommendationRow>> {
    const q = params?.q?.trim()
    const { page, pageSize, skip, take } = normalizeAdminPage(params)
    const where: Prisma.RecommendationWhereInput = q
      ? {
          OR: [
            { product: { name: { contains: q, mode: 'insensitive' } } },
            { reason: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.recommendation.count({ where }),
      this.prisma.recommendation.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take,
        include: {
          product: { select: { id: true, name: true } },
        },
      }),
    ])

    return {
      items: rows.map((r) => ({
        id: r.id,
        productId: r.productId,
        productName: r.product.name,
        requirementId: r.requirementId,
        score: r.score,
        reason: r.reason,
        createdAt: r.createdAt,
      })),
      total,
      page,
      pageSize,
    }
  }

  async deleteRecommendationById(id: number): Promise<boolean> {
    const existing = await this.prisma.recommendation.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!existing) return false
    await this.prisma.recommendation.delete({ where: { id } })
    return true
  }

  private toListItem(product: {
    id: number
    companyId: number
    name: string
    brand: string | null
    model: string | null
    category: string | null
    productUrl: string | null
    imageUrl: string | null
    company?: { id?: number; name: string; logoUrl?: string | null } | null
    specs: {
      processor: string | null
      gpu: string | null
      ram: string | null
      storage: string | null
      screen: string | null
      operatingSystem: string | null
    } | null
    prices: Array<{ price: { toString(): string }; currency: string; updatedAt: Date }>
  }): ProductListItem {
    return {
      id: product.id,
      companyId: product.companyId,
      name: product.name,
      brand: product.brand,
      model: product.model,
      category: product.category,
      productUrl: product.productUrl,
      imageUrl: product.imageUrl,
      company: product.company ?? null,
      specs: product.specs,
      latestPrice: product.prices[0] ?? null,
    }
  }

  private toAdminItem(product: {
    id: number
    companyId: number
    name: string
    brand: string | null
    model: string | null
    category: string | null
    productUrl: string | null
    imageUrl: string | null
    externalSku: string | null
    createdAt: Date
    updatedAt: Date
    specs: ProductListItem['specs']
    prices: Array<{
      id: number
      price: { toString(): string }
      currency: string
      available: boolean
      stockQty: number | null
      updatedAt: Date
    }>
    company: { name: string; slug: string }
    tagRelations: Array<{ tag: { id: number; name: string } }>
  }): ProductAdminItem {
    return {
      ...this.toListItem(product),
      externalSku: product.externalSku,
      companyName: product.company.name,
      companySlug: product.company.slug,
      tags: product.tagRelations.map((r) => ({ id: r.tag.id, name: r.tag.name })),
      prices: product.prices.map((p) => ({
        id: p.id,
        price: p.price,
        currency: p.currency,
        available: p.available,
        stockQty: p.stockQty,
        updatedAt: p.updatedAt,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }
}
