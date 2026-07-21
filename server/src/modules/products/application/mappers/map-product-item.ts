import { ProductListItem } from '../../domain/repositories/product.repository'

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
