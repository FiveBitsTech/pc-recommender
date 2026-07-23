'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

const ResultSidebar = ({ formData, recommendations, onReset }) => {
  const bestScore = recommendations.length > 0
    ? Math.max(...recommendations.map((r) => r.score))
    : 0

  const confidencePercent = Math.round((bestScore / 10) * 100)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Search summary */}
      <Card variant='outlined'>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='subtitle2' fontWeight={700}>
              Resumen de tu búsqueda
            </Typography>
            <Button size='small' onClick={onReset}>
              Editar
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-computer-line' style={{ fontSize: '1rem', opacity: 0.6 }} />
              <Box>
                <Typography variant='caption' color='text.secondary'>Qué buscas</Typography>
                <Typography variant='body2' fontWeight={500}>
                  {formData.deviceType === 'laptop' ? 'Laptop' : 'PC completa'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-code-s-slash-line' style={{ fontSize: '1rem', opacity: 0.6 }} />
              <Box>
                <Typography variant='caption' color='text.secondary'>Uso principal</Typography>
                <Typography variant='body2' fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                  {formData.usageType}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-money-dollar-circle-line' style={{ fontSize: '1rem', opacity: 0.6 }} />
              <Box>
                <Typography variant='caption' color='text.secondary'>Presupuesto</Typography>
                <Typography variant='body2' fontWeight={500}>
                  S/ {formData.budget?.toLocaleString('es-PE')}
                  {formData.budgetFlexible ? ' (flexible)' : ''}
                </Typography>
              </Box>
            </Box>

            {formData.priority && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='ri-focus-3-line' style={{ fontSize: '1rem', opacity: 0.6 }} />
                <Box>
                  <Typography variant='caption' color='text.secondary'>Prioridad</Typography>
                  <Typography variant='body2' fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                    {formData.priority}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Confidence score */}
      <Card variant='outlined'>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant='subtitle2' fontWeight={700} gutterBottom>
            Nivel de confianza
          </Typography>

          <Box sx={{ position: 'relative', display: 'inline-flex', my: 1 }}>
            <CircularProgress
              variant='determinate'
              value={confidencePercent}
              size={80}
              thickness={4}
              color='success'
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant='h6' fontWeight={700} color='success.main'>
                {confidencePercent}%
              </Typography>
            </Box>
          </Box>

          <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
            {confidencePercent >= 80 ? 'Alta' : confidencePercent >= 60 ? 'Media' : 'Baja'}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Basado en {recommendations.length} opciones analizadas
          </Typography>
        </CardContent>
      </Card>

      {/* Help card */}
      <Card variant='outlined' sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <i className='ri-robot-2-line' style={{ fontSize: '1.5rem', marginBottom: 8 }} />
          <Typography variant='subtitle2' fontWeight={600} gutterBottom sx={{ color: 'white' }}>
            ¿Necesitas ayuda?
          </Typography>
          <Typography variant='caption' sx={{ opacity: 0.85, display: 'block', mb: 2, color:'white' }}>
            Nuestro asesor IA puede resolver tus dudas
          </Typography>
          <Button variant='contained' size='small' color='inherit' sx={{ color: 'primary.main' }}>
            Preguntar al asesor IA
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ResultSidebar
