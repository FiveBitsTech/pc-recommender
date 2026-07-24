import { ProductAdminItem, ProductListItem, ProductTagItem } from '../../domain/repositories/product.repository'

export const mapProductItem = (product: ProductListItem) => ({
  id: product.id,
  companyId: product.companyId,
  name: product.name,
  brand: product.brand,
  model: product.model,
  category: product.category,
  productUrl: product.productUrl,
  imageUrl: product.imageUrl,
  specs: product.specs,
  latestPrice: product.latestPrice
    ? {
        price: Number(product.latestPrice.price),
        currency: product.latestPrice.currency,
        updatedAt: product.latestPrice.updatedAt,
      }
    : null,
})

export const mapAdminProductItem = (product: ProductAdminItem) => ({
  ...mapProductItem(product),
  externalSku: product.externalSku,
  companyName: product.companyName,
  companySlug: product.companySlug,
  tags: product.tags,
  prices: product.prices.map((p) => ({
    id: p.id,
    price: Number(p.price),
    currency: p.currency,
    available: p.available,
    stockQty: p.stockQty,
    updatedAt: p.updatedAt,
  })),
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
})

export const mapProductTagItem = (tag: ProductTagItem) => ({
  id: tag.id,
  name: tag.name,
  productCount: tag.productCount,
  createdAt: tag.createdAt,
})
