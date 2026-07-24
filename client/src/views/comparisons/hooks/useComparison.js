import { useState, useCallback } from 'react'

import { useGetProductsQuery, useCompareProductsMutation } from '../api/comparisonApi'

const useComparison = () => {
  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery()
  const [compareProducts, { isLoading: isComparing }] = useCompareProductsMutation()

  const [selectedProducts, setSelectedProducts] = useState([null, null])
  const [comparisonResult, setComparisonResult] = useState(null)
  const [error, setError] = useState(null)

  const selectProduct = useCallback((index, product) => {
    setSelectedProducts((prev) => {
      const updated = [...prev]

      updated[index] = product

      return updated
    })

    setComparisonResult(null)
  }, [])

  const removeProduct = useCallback((index) => {
    setSelectedProducts((prev) => {
      const updated = [...prev]

      updated[index] = null

      return updated
    })

    setComparisonResult(null)
  }, [])

  const compare = useCallback(async () => {
    if (!selectedProducts[0] || !selectedProducts[1]) return

    setError(null)

    try {
      const result = await compareProducts({
        productOneId: selectedProducts[0].id,
        productTwoId: selectedProducts[1].id,
      }).unwrap()

      setComparisonResult(result)
    } catch (err) {
      setError('Error al generar la comparación. Intenta de nuevo.')
    }
  }, [selectedProducts, compareProducts])

  const reset = useCallback(() => {
    setSelectedProducts([null, null])
    setComparisonResult(null)
    setError(null)
  }, [])

  const products = productsData?.items ?? []
  const canCompare = selectedProducts[0] && selectedProducts[1] && selectedProducts[0].id !== selectedProducts[1].id

  return {
    products,
    isLoadingProducts,
    selectedProducts,
    comparisonResult,
    isComparing,
    canCompare,
    error,
    selectProduct,
    removeProduct,
    compare,
    reset,
  }
}

export default useComparison
