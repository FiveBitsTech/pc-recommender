'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const SettingsPage = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant='h4' fontWeight={700} gutterBottom>
        Preferencias
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Ajustes de tu cuenta (notificaciones, perfil y preferencias personales)
      </Typography>

      <Card variant='outlined'>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <i className='ri-user-settings-line' style={{ fontSize: '3rem', opacity: 0.3 }} />
          <Typography variant='h6' color='text.secondary' sx={{ mt: 2 }}>
            Próximamente
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Aquí configurarás tu cuenta. El scraping de tiendas está en el panel admin → Scraping.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SettingsPage
