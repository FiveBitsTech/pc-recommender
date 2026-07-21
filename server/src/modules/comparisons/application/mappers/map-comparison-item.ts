import { ComparisonRecord } from '../../domain/repositories/comparison.repository'

export const mapComparisonItem = (item: ComparisonRecord) => ({
  id: item.id,
  productOneId: item.productOneId,
  productTwoId: item.productTwoId,
  analysis: item.analysis,
  createdAt: item.createdAt,
})
