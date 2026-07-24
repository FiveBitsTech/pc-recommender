'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

import ProductSelector from './components/ProductSelector'
import ComparisonResult from './components/ComparisonResult'
import useComparison from './hooks/useComparison'

const ComparisonsPage = () => {
  const {
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
  } = useComparison()

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant='h4' fontWeight={700} gutterBottom>
        Comparar equipos
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Selecciona dos productos para generar un análisis comparativo con IA
      </Typography>

      {/* Product selectors */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <ProductSelector
          index={0}
          products={products}
          selected={selectedProducts[0]}
          onSelect={selectProduct}
          onRemove={removeProduct}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant='h5' color='text.secondary' fontWeight={700}>
            VS
          </Typography>
        </Box>

        <ProductSelector
          index={1}
          products={products}
          selected={selectedProducts[1]}
          onSelect={selectProduct}
          onRemove={removeProduct}
        />
      </Box>

      {/* Compare button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
        <Button
          variant='contained'
          size='large'
          onClick={compare}
          disabled={!canCompare || isComparing}
          startIcon={isComparing ? <CircularProgress size={20} color='inherit' /> : <i className='ri-sparkling-line' />}
        >
          {isComparing ? 'Analizando...' : 'Comparar con IA'}
        </Button>
        {comparisonResult && (
          <Button variant='outlined' size='large' onClick={reset} startIcon={<i className='ri-refresh-line' />}>
            Nueva comparación
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Comparison result */}
      <ComparisonResult result={comparisonResult} products={selectedProducts} />
    </Box>
  )
}

export default ComparisonsPage
