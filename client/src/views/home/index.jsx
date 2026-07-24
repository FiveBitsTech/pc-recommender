'use client'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import { useGetRecentRequirementsQuery } from './api/homeApi'

const FEATURES = [
  { icon: 'ri-robot-2-line', title: 'Asesor con IA', description: 'Recomendaciones personalizadas basadas en tu presupuesto y necesidades' },
  { icon: 'ri-scales-3-line', title: 'Comparador', description: 'Compara equipos lado a lado con análisis técnico detallado' },
  { icon: 'ri-tools-line', title: 'Armador de PC', description: 'Genera configuraciones con componentes compatibles y precios reales' },
  { icon: 'ri-shield-check-line', title: 'Sin sobreprecios', description: 'Detectamos precios inflados para que no pagues de más' },
]

const STEPS = [
  { number: '1', title: 'Cuéntanos qué necesitas', description: 'Selecciona tipo de equipo, uso y presupuesto', icon: 'ri-questionnaire-line' },
  { number: '2', title: 'Analizamos el mercado', description: 'IA revisa compatibilidad, precios y opciones disponibles', icon: 'ri-search-eye-line' },
  { number: '3', title: 'Recibe recomendaciones', description: 'Opciones ordenadas con ventajas, desventajas y tiendas', icon: 'ri-sparkling-line' },
]

const USAGE_ICONS = {
  gaming: 'ri-gamepad-line',
  oficina: 'ri-briefcase-line',
  'diseño gráfico': 'ri-palette-line',
  programación: 'ri-code-s-slash-line',
  estudio: 'ri-graduation-cap-line',
  streaming: 'ri-live-line',
}

const HomePage = () => {
  const router = useRouter()
  const { data: recentData, isLoading } = useGetRecentRequirementsQuery()

  const recentItems = recentData?.items ?? []

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 3,
          background: 'linear-gradient(135deg, var(--mui-palette-primary-main) 0%, var(--mui-palette-primary-dark) 100%)',
          borderRadius: 3,
          color: 'white',
          mb: 6,
        }}
      >
        <Typography variant='h3' fontWeight={800} gutterBottom>
          PC-Cotiza IA
        </Typography>
        <Typography variant='h6' sx={{ opacity: 0.9, mb: 1 }}>
          Tu asesor tecnológico imparcial
        </Typography>
        <Typography variant='body1' sx={{ opacity: 0.8, maxWidth: 600, mx: 'auto', mb: 4 }}>
          Encuentra la computadora o componentes ideales según tu presupuesto y necesidades.
          Comparamos precios, validamos compatibilidad y te explicamos por qué cada opción es la mejor para ti.
        </Typography>
        <Button
          variant='contained'
          size='large'
          color='inherit'
          sx={{ color: 'primary.main', fontWeight: 700, px: 5, py: 1.5 }}
          onClick={() => router.push('/requirements')}
          startIcon={<i className='ri-sparkling-line' />}
        >
          Empezar ahora
        </Button>
      </Box>

      {/* Features Grid */}
      <Box sx={{ mb: 6, px: 1 }}>
        <Grid container spacing={2}>
          {FEATURES.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Card variant='outlined' sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <i className={f.icon} style={{ fontSize: '2rem', color: 'var(--mui-palette-primary-main)' }} />
                  <Typography variant='subtitle1' fontWeight={700} sx={{ mt: 1.5 }}>
                    {f.title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {f.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How it works */}
      <Box sx={{ mb: 6, px: 1 }}>
        <Typography variant='h5' fontWeight={700} textAlign='center' gutterBottom>
          ¿Cómo funciona?
        </Typography>
        <Typography variant='body1' color='text.secondary' textAlign='center' sx={{ mb: 4 }}>
          En 3 simples pasos obtienes recomendaciones personalizadas
        </Typography>

        <Grid container spacing={3} justifyContent='center'>
          {STEPS.map((step) => (
            <Grid item xs={12} sm={4} key={step.number}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'primary.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <i className={step.icon} style={{ fontSize: '1.75rem', color: 'var(--mui-palette-primary-main)' }} />
                </Box>
                <Typography variant='subtitle1' fontWeight={700}>
                  {step.title}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Popular / Recent Searches */}
      <Box sx={{ px: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant='h5' fontWeight={700}>
            Búsquedas de la comunidad
          </Typography>
          <Chip label='En tiempo real' size='small' color='primary' variant='outlined' />
        </Box>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : recentItems.length === 0 ? (
          <Typography variant='body2' color='text.secondary' textAlign='center' sx={{ py: 4 }}>
            Aún no hay búsquedas. Sé el primero en usar el asesor IA.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {recentItems.map((req) => (
              <Grid item xs={12} sm={6} md={4} key={req.id}>
                <Card variant='outlined' sx={{ '&:hover': { boxShadow: 3 } }}>
                  <CardActionArea onClick={() => router.push('/requirements')}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: 'primary.lighter',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <i
                          className={USAGE_ICONS[req.usageType] || 'ri-computer-line'}
                          style={{ fontSize: '1.25rem', color: 'var(--mui-palette-primary-main)' }}
                        />
                      </Box>
                      <Box>
                        <Typography variant='body1' fontWeight={600}>
                          {req.deviceType === 'laptop' ? 'Laptop' : 'PC'} para {req.usageType}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Presupuesto: S/ {req.budget?.toLocaleString('es-PE')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  )
}

export default HomePage
