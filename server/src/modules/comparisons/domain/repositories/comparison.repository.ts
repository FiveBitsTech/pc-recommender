export const COMPARISON_REPOSITORY = 'COMPARISON_REPOSITORY'

export type ComparisonRecord = {
  id: number
  productOneId: number
  productTwoId: number
  analysis: string | null
  createdAt: Date
}

export interface ComparisonRepository {
  findAll(): Promise<ComparisonRecord[]>
}
