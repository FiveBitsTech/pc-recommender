import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/prisma/prisma.service'
import { ProductFilterParams, ProductListItem, ProductRepository } from '../../domain/repositories/product.repository'

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
            price: {
              gte: filters.minPrice ?? 0,
              lte: filters.maxPrice,
            },
          },
        },
      },
      orderBy: { id: 'desc' },
      take: filters.limit ?? 5,
      include: {
        company: { select: { id: true, name: true, logoUrl: true } },
        specs: true,
        prices: { orderBy: { updatedAt: 'desc' }, take: 1 },
      },
    })

    return products.map((p) => this.toListItem(p))
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
    company: { id: number; name: string; logoUrl: string | null } | null
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
}
