import { TagRecord } from '../../domain/repositories/tag.repository'

export const mapTagItem = (tag: TagRecord) => ({
  id: tag.id,
  name: tag.name,
})
