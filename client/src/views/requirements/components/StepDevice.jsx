'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { DEVICE_OPTIONS } from '../utils/chatSteps'

const StepDevice = ({ value, onChange, onNext }) => {
  const handleSelect = (deviceValue) => {
    onChange('deviceType', deviceValue)
    onNext()
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
      <Typography variant='h5' fontWeight={700} textAlign='center' gutterBottom>
        ¿Qué estás buscando?
      </Typography>
      <Typography variant='body1' color='text.secondary' textAlign='center' sx={{ mb: 4 }}>
        Selecciona el tipo de equipo que necesitas
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {DEVICE_OPTIONS.map((option) => {
          const isSelected = value === option.value

          return (
            <Card
              key={option.value}
              variant='outlined'
              sx={{
                borderColor: isSelected ? 'primary.main' : 'divider',
                borderWidth: isSelected ? 2 : 1,
                bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                transition: 'all 0.2s',
              }}
            >
              <CardActionArea onClick={() => handleSelect(option.value)}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isSelected
                        ? (theme) => alpha(theme.palette.primary.main, 0.12)
                        : 'action.hover',
                    }}
                  >
                    <i className={option.icon} style={{ fontSize: '1.5rem' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='subtitle1' fontWeight={600}>
                      {option.label}
                    </Typography>
                    {option.description && (
                      <Typography variant='body2' color='text.secondary'>
                        {option.description}
                      </Typography>
                    )}
                  </Box>
                  {isSelected && (
                    <i className='ri-checkbox-circle-fill' style={{ fontSize: '1.5rem', color: 'var(--mui-palette-primary-main)' }} />
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}

export default StepDevice
