export const COMPARISON_REPOSITORY = 'COMPARISON_REPOSITORY'

export type ComparisonRecord = {
  id: number
  productOneId: number
  productTwoId: number
  analysis: string | null
  createdAt: Date
}

export type CreateComparisonInput = {
  productOneId: number
  productTwoId: number
  analysis: string
}

export interface ComparisonRepository {
  findAll(): Promise<ComparisonRecord[]>
  findByProducts(productOneId: number, productTwoId: number): Promise<ComparisonRecord | null>
  create(data: CreateComparisonInput): Promise<ComparisonRecord>
}
