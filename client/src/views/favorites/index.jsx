'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const FavoritesPage = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant='h4' fontWeight={700} gutterBottom>
        Favoritos
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Equipos guardados para revisar después
      </Typography>

      <Card variant='outlined'>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <i className='ri-heart-line' style={{ fontSize: '3rem', opacity: 0.3 }} />
          <Typography variant='h6' color='text.secondary' sx={{ mt: 2 }}>
            Próximamente
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Aquí podrás ver los equipos que marcaste como favoritos
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default FavoritesPage
