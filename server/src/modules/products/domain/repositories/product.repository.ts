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
  company: { id: number; name: string; logoUrl: string | null } | null
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
  minPrice?: number
  maxPrice: number
  limit?: number
}

export interface ProductRepository {
  findAll(): Promise<ProductListItem[]>
  findById(id: number): Promise<ProductListItem | null>
  findByFilters(filters: ProductFilterParams): Promise<ProductListItem[]>
}
