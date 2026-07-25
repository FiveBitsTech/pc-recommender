'use client'

import { useCallback, useEffect, useState } from 'react'

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]

/**
 * Valor con debounce (mismo criterio que Calendary `usePagination` ~500ms):
 * el input se actualiza al tiro; la query al servidor espera a que dejes de teclear.
 */
export const useDebouncedValue = (value, delayMs = 500) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)

    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

/** Paginación de servidor (page 0-based como TablePagination de MUI). */
export const useServerPagination = ({ defaultPageSize = 10 } = {}) => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const resetPage = useCallback(() => setPage(0), [])

  const handlePageChange = useCallback((_event, nextPage) => {
    setPage(nextPage)
  }, [])

  const handlePageSizeChange = useCallback(event => {
    setPageSize(Number(event.target.value))
    setPage(0)
  }, [])

  return {
    page,
    pageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    resetPage,
    handlePageChange,
    handlePageSizeChange
  }
}

/** Resetea a página 0 cuando cambian filtros (búsqueda debounced / empresa). */
export const useResetPageOnFilter = (resetPage, ...deps) => {
  useEffect(() => {
    resetPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export default useServerPagination
