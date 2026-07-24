'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const SettingsPage = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant='h4' fontWeight={700} gutterBottom>
        Configuración
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Preferencias y ajustes de tu cuenta
      </Typography>

      <Card variant='outlined'>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <i className='ri-settings-3-line' style={{ fontSize: '3rem', opacity: 0.3 }} />
          <Typography variant='h6' color='text.secondary' sx={{ mt: 2 }}>
            Próximamente
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Aquí podrás configurar tus preferencias, notificaciones y perfil
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SettingsPage
