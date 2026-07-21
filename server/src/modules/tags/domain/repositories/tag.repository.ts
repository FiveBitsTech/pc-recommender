export const TAG_REPOSITORY = 'TAG_REPOSITORY'

export type TagRecord = {
  id: number
  name: string
}

export interface TagRepository {
  findAll(): Promise<TagRecord[]>
}
