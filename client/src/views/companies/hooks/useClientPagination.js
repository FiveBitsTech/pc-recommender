'use client'

import { useEffect, useMemo, useState } from 'react'

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

/** page es 0-based (como MUI TablePagination). */
export const useClientPagination = (items = [], { defaultPageSize = DEFAULT_PAGE_SIZE } = {}) => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const total = items.length

  useEffect(() => {
    setPage(0)
  }, [pageSize, total])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(total / pageSize) - 1)
    if (page > maxPage) setPage(maxPage)
  }, [page, pageSize, total])

  const pagedItems = useMemo(() => {
    const start = page * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  const handlePageChange = (_event, newPage) => setPage(newPage)

  const handlePageSizeChange = event => {
    setPageSize(Number(event.target.value))
    setPage(0)
  }

  return {
    page,
    pageSize,
    total,
    pagedItems,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    handlePageChange,
    handlePageSizeChange,
    resetPage: () => setPage(0)
  }
}

export default useClientPagination
