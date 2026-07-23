export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY'

export type ProductListItem = {
  id: number
  companyId: number
  name: string
  brand: string | null
  model: string | null
  category: string | null
  productUrl: string | null
  imageUrl: string | null
  specs: {
    processor: string | null
    gpu: string | null
    ram: string | null
    storage: string | null
    screen: string | null
    operatingSystem: string | null
  } | null
  latestPrice: {
    price: { toString(): string }
    currency: string
    updatedAt: Date
  } | null
}

export type ProductFilterParams = {
  category: string
  maxPrice: number
  limit?: number
}

export interface ProductRepository {
  findAll(): Promise<ProductListItem[]>
  findById(id: number): Promise<ProductListItem | null>
  findByFilters(filters: ProductFilterParams): Promise<ProductListItem[]>
}
