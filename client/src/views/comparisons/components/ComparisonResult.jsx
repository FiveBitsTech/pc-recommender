'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

const ComparisonResult = ({ result, products }) => {
  if (!result) return null

  const { analysis, winner, specs_comparison: specsComparison } = result

  return (
    <Card variant='outlined'>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <i className='ri-sparkling-line' style={{ fontSize: '1.5rem', color: 'var(--mui-palette-primary-main)' }} />
          <Typography variant='h6' fontWeight={700}>
            Análisis comparativo
          </Typography>
        </Box>

        {/* Winner */}
        {winner && (
          <Box sx={{ bgcolor: 'success.lighter', borderRadius: 2, p: 2, mb: 3, border: '1px solid', borderColor: 'success.main' }}>
            <Typography variant='subtitle1' fontWeight={700} color='success.main'>
              <i className='ri-trophy-line' style={{ marginRight: 6 }} />
              Ganador: {winner}
            </Typography>
          </Box>
        )}

        {/* AI Analysis */}
        {analysis && (
          <Box sx={{ mb: 3 }}>
            <Typography variant='body1' sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
              {analysis}
            </Typography>
          </Box>
        )}

        {/* Especificaciones comparación */}
        {specsComparison && specsComparison.length > 0 && (
          <>
            <Divider sx={{ mb: 3 }} />
            <Typography variant='subtitle1' fontWeight={700} gutterBottom>
              Comparación detallada
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {specsComparison.map((spec, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant='body2' fontWeight={600} sx={{ minWidth: 120 }}>
                    {spec.category}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2'>{spec.product1}</Typography>
                  </Box>
                  <Chip
                    label={spec.winner === 'empate' ? '=' : spec.winner === 'product1' ? '👈' : '👉'}
                    size='small'
                    color={spec.winner === 'empate' ? 'default' : 'primary'}
                  />
                  <Box sx={{ flex: 1, textAlign: 'right' }}>
                    <Typography variant='body2'>{spec.product2}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ComparisonResult
