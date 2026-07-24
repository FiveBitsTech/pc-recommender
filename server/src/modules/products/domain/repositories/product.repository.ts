export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY'

export type ProductSpecs = {
  processor: string | null
  gpu: string | null
  ram: string | null
  storage: string | null
  screen: string | null
  operatingSystem: string | null
}

export type ProductPriceSnapshot = {
  id: number
  price: { toString(): string }
  currency: string
  available: boolean
  stockQty: number | null
  updatedAt: Date
}

export type ProductListItem = {
  id: number
  companyId: number
  name: string
  brand: string | null
  model: string | null
  category: string | null
  productUrl: string | null
  imageUrl: string | null
  specs: ProductSpecs | null
  latestPrice: {
    price: { toString(): string }
    currency: string
    updatedAt: Date
  } | null
}

export type ProductAdminItem = ProductListItem & {
  externalSku: string | null
  companyName: string
  companySlug: string
  tags: Array<{ id: number; name: string }>
  prices: ProductPriceSnapshot[]
  createdAt: Date
  updatedAt: Date
}

export type ProductAdminListParams = {
  q?: string
  companyId?: number
}

export type ProductUpdateInput = {
  name?: string
  brand?: string | null
  model?: string | null
  category?: string | null
  productUrl?: string | null
  imageUrl?: string | null
  externalSku?: string | null
  specs?: Partial<ProductSpecs> | null
}

export type ProductTagItem = {
  id: number
  name: string
  productCount: number
  createdAt: Date
}

export type AdminPriceRow = {
  id: number
  productId: number
  productName: string
  companyName: string
  price: { toString(): string }
  currency: string
  available: boolean
  stockQty: number | null
  updatedAt: Date
}

export type AdminSpecRow = {
  id: number
  productId: number
  productName: string
  companyName: string
  processor: string | null
  gpu: string | null
  ram: string | null
  storage: string | null
  screen: string | null
  operatingSystem: string | null
}

export type AdminComparisonRow = {
  id: number
  productOneId: number
  productOneName: string
  productTwoId: number
  productTwoName: string
  analysis: string | null
  createdAt: Date
}

export type AdminRecommendationRow = {
  id: number
  productId: number
  productName: string
  requirementId: number
  score: { toString(): string }
  reason: string | null
  createdAt: Date
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
  findAdminAll(params?: ProductAdminListParams): Promise<ProductAdminItem[]>
  findAdminById(id: number): Promise<ProductAdminItem | null>
  updateAdmin(id: number, data: ProductUpdateInput): Promise<ProductAdminItem | null>
  deleteById(id: number): Promise<boolean>
  listTags(): Promise<ProductTagItem[]>
  deleteTagById(id: number): Promise<boolean>
  listAdminPrices(): Promise<AdminPriceRow[]>
  listAdminSpecs(): Promise<AdminSpecRow[]>
  listAdminComparisons(): Promise<AdminComparisonRow[]>
  deleteComparisonById(id: number): Promise<boolean>
  listAdminRecommendations(): Promise<AdminRecommendationRow[]>
  deleteRecommendationById(id: number): Promise<boolean>
}
