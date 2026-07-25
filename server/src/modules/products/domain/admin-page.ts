export type AdminPageParams = {
  page?: number
  pageSize?: number
  q?: string
  companyId?: number
}

export type AdminPageResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export function normalizeAdminPage(params?: Pick<AdminPageParams, 'page' | 'pageSize'>) {
  const page = Math.max(0, Number(params?.page) || 0)
  const pageSize = Math.min(100, Math.max(1, Number(params?.pageSize) || 10))
  return { page, pageSize, skip: page * pageSize, take: pageSize }
}
