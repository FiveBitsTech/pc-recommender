'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

const HistoryDetail = ({ requirement, recommendations, isLoading, onClose }) => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Button variant='text' onClick={onClose} startIcon={<i className='ri-arrow-left-line' />}>
          Volver al historial
        </Button>
      </Box>

      {/* Summary */}
      <Card variant='outlined' sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' fontWeight={700} gutterBottom>
            Resumen de la cotización
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip icon={<i className='ri-computer-line' />} label={requirement.deviceType === 'laptop' ? 'Laptop' : 'PC completa'} />
            <Chip icon={<i className='ri-code-s-slash-line' />} label={requirement.usageType} />
            <Chip icon={<i className='ri-money-dollar-circle-line' />} label={`S/ ${requirement.budget?.toLocaleString('es-PE')}`} />
            <Chip icon={<i className='ri-focus-3-line' />} label={requirement.priority} />
          </Box>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {isLoading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            Cargando recomendaciones...
          </Typography>
        </Box>
      ) : recommendations.length === 0 ? (
        <Card variant='outlined'>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant='body1' color='text.secondary'>
              Esta cotización no tiene recomendaciones generadas aún.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant='subtitle1' fontWeight={700}>
            Recomendaciones ({recommendations.length})
          </Typography>

          {recommendations.map((rec, index) => (
            <Card key={rec.id || index} variant='outlined'>
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Rank */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: index === 0 ? 'success.lighter' : index === 1 ? 'primary.lighter' : 'warning.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}
                >
                  #{index + 1}
                </Box>

                {/* Product info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant='subtitle2' fontWeight={700}>
                    {rec.product?.name || `Producto #${rec.productId}`}
                  </Typography>
                  {rec.reason && (
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                      {rec.reason}
                    </Typography>
                  )}
                </Box>

                {/* Score + Price */}
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  {rec.product?.price && (
                    <Typography variant='subtitle1' color='primary.main' fontWeight={700}>
                      S/ {rec.product.price.toLocaleString('es-PE')}
                    </Typography>
                  )}
                  <Chip
                    label={`${Number(rec.score).toFixed(1)}/10`}
                    size='small'
                    color='primary'
                    variant='outlined'
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default HistoryDetail
