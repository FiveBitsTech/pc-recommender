'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

const USAGE_ICONS = {
  gaming: 'ri-gamepad-line',
  oficina: 'ri-briefcase-line',
  'diseño gráfico': 'ri-palette-line',
  'programación': 'ri-code-s-slash-line',
  estudio: 'ri-graduation-cap-line',
  streaming: 'ri-live-line',
  profesional: 'ri-building-line',
}

const HistoryCard = ({ requirement, onView }) => {
  const icon = USAGE_ICONS[requirement.usageType] || 'ri-computer-line'

  const date = new Date(requirement.createdAt).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card variant='outlined' sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: 3 } }}>
      <CardActionArea onClick={() => onView(requirement)}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, py: 2.5 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <i className={icon} style={{ fontSize: '1.5rem', color: 'var(--mui-palette-primary-main)' }} />
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle1' fontWeight={600}>
              {requirement.deviceType === 'laptop' ? 'Laptop' : 'PC'} para {requirement.usageType}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Presupuesto: S/ {requirement.budget?.toLocaleString('es-PE')} | Prioridad: {requirement.priority}
            </Typography>
          </Box>

          {/* Date + chips */}
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
              {date}
            </Typography>
            <Chip
              label={requirement.deviceType}
              size='small'
              variant='outlined'
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default HistoryCard
