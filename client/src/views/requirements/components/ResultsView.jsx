'use client'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

import ResultCard from './ResultCard'
import ResultDetail from './ResultDetail'
import ResultSidebar from './ResultSidebar'

const ResultsView = ({ recommendations, formData, selectedProduct, onSelectProduct, onReset }) => {
  const topThree = recommendations.slice(0, 3)

  return (
    <Box>
      {/* Results header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant='h5' fontWeight={700}>
            Tus recomendaciones
          </Typography>
          <Button variant='outlined' size='small' onClick={onReset} startIcon={<i className='ri-refresh-line' />}>
            Nueva búsqueda
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            Basadas en: {formData.deviceType === 'laptop' ? 'Laptop' : 'PC'} para {formData.usageType} con presupuesto de S/ {formData.budget?.toLocaleString('es-PE')}
          </Typography>
          <Chip label={`${recommendations.length} opciones encontradas`} size='small' variant='outlined' />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main content */}
        <Grid item xs={12} lg={9}>
          {/* Product cards grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {topThree.map((rec, index) => (
              <Grid item xs={12} sm={4} key={rec.id}>
                <ResultCard
                  recommendation={rec}
                  index={index}
                  isSelected={selectedProduct?.id === rec.id}
                  onSelect={onSelectProduct}
                />
              </Grid>
            ))}
          </Grid>

          {/* Detail section */}
          {selectedProduct && <ResultDetail recommendation={selectedProduct} />}

          {/* If no product selected, show prompt */}
          {!selectedProduct && topThree.length > 0 && (
            <Box sx={{ textAlign: 'center', py: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                <i className='ri-cursor-line' style={{ marginRight: 4 }} />
                Selecciona una opción para ver los detalles completos
              </Typography>
            </Box>
          )}
        </Grid>

        {/* Right sidebar */}
        <Grid item xs={12} lg={3}>
          <ResultSidebar
            formData={formData}
            recommendations={recommendations}
            onReset={onReset}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default ResultsView
