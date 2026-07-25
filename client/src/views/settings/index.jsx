'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

import { useAuthUser } from '@/hooks/useAuthUser'
import { useShowPerfilMenu } from '@/hooks/useShowPerfilMenu'

const SettingsPage = () => {
  const router = useRouter()
  const { ready, isAdmin } = useAuthUser()
  const { showPerfilMenu, toggleShowPerfilMenu } = useShowPerfilMenu()

  useEffect(() => {
    if (ready && !isAdmin) router.replace('/home')
  }, [ready, isAdmin, router])

  if (ready && !isAdmin) return null

  return (
    <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
      <Typography variant='h4' fontWeight={700} gutterBottom>
        Ajustes
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Configuración de la plataforma (solo administradores)
      </Typography>

      <Card variant='outlined'>
        <CardContent className='flex flex-col gap-3'>
          <Typography variant='h6'>Menú Perfil</Typography>
          <Typography variant='body2' color='text.secondary'>
            La sección Perfil del menú es para el usuario final (inicio, cotizaciones, armador, etc.). Por defecto
            está oculta; actívala cuando quieras mostrarla en la navegación.
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showPerfilMenu}
                onChange={(_, checked) => toggleShowPerfilMenu(checked)}
                color='primary'
              />
            }
            label={showPerfilMenu ? 'Menú Perfil visible' : 'Menú Perfil oculto'}
          />
        </CardContent>
      </Card>
    </Box>
  )
}

export default SettingsPage
