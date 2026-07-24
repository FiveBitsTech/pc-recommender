'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha } from '@mui/material/styles'

import BuildResult from './components/BuildResult'
import useBuilder from './hooks/useBuilder'

const USAGE_OPTIONS = [
  { value: 'gaming', label: 'Gaming', icon: 'ri-gamepad-line' },
  { value: 'programación', label: 'Programación', icon: 'ri-code-s-slash-line' },
  { value: 'diseño gráfico', label: 'Diseño / Edición', icon: 'ri-palette-line' },
  { value: 'oficina', label: 'Oficina', icon: 'ri-briefcase-line' },
  { value: 'streaming', label: 'Streaming', icon: 'ri-live-line' },
  { value: 'inteligencia artificial', label: 'IA / Machine Learning', icon: 'ri-robot-2-line' },
]

const BRAND_OPTIONS = [
  { value: null, label: 'Sin preferencia', icon: 'ri-equalizer-line' },
  { value: 'Intel', label: 'Team Intel', icon: 'ri-cpu-line' },
  { value: 'AMD', label: 'Team AMD', icon: 'ri-cpu-fill' },
]

const BuilderPage = () => {
  const {
    formData,
    result,
    isBuilding,
    canSubmit,
    error,
    updateFormData,
    submit,
    reset,
  } = useBuilder()

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant='h4' fontWeight={700} gutterBottom>
        Armador de PC
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Dinos para qué la usarás y tu presupuesto. La IA generará una configuración con componentes compatibles.
      </Typography>

      {/* Form — only show when no result */}
      {!result && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Usage selection */}
          <Box>
            <Typography variant='subtitle1' fontWeight={600} gutterBottom>
              ¿Para qué usarás la PC?
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
              {USAGE_OPTIONS.map((opt) => {
                const isSelected = formData.usageType === opt.value

                return (
                  <Card
                    key={opt.value}
                    variant='outlined'
                    sx={{
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderWidth: isSelected ? 2 : 1,
                      bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                    }}
                  >
                    <CardActionArea onClick={() => updateFormData('usageType', opt.value)}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, py: 2.5 }}>
                        <i className={opt.icon} style={{ fontSize: '1.5rem' }} />
                        <Typography variant='body2' fontWeight={isSelected ? 700 : 500}>
                          {opt.label}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                )
              })}
            </Box>
          </Box>

          {/* Budget */}
          <TextField
            fullWidth
            label='Presupuesto total'
            type='number'
            value={formData.budget || ''}
            onChange={(e) => updateFormData('budget', parseInt(e.target.value, 10) || 0)}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position='start'>S/</InputAdornment>,
              },
            }}
          />

          {/* Brand preference */}
          <Box>
            <Typography variant='subtitle1' fontWeight={600} gutterBottom>
              Preferencia de procesador (opcional)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {BRAND_OPTIONS.map((opt) => {
                const isSelected = formData.brandPreference === opt.value

                return (
                  <Card
                    key={opt.label}
                    variant='outlined'
                    sx={{
                      flex: 1,
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderWidth: isSelected ? 2 : 1,
                      bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                    }}
                  >
                    <CardActionArea onClick={() => updateFormData('brandPreference', opt.value)}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 2 }}>
                        <i className={opt.icon} style={{ fontSize: '1.25rem' }} />
                        <Typography variant='body2' fontWeight={isSelected ? 700 : 500}>
                          {opt.label}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                )
              })}
            </Box>
          </Box>

          {/* Submit */}
          <Button
            variant='contained'
            size='large'
            onClick={submit}
            disabled={!canSubmit || isBuilding}
            startIcon={isBuilding ? <CircularProgress size={20} color='inherit' /> : <i className='ri-tools-line' />}
            sx={{ alignSelf: 'center', px: 6 }}
          >
            {isBuilding ? 'Generando configuración...' : 'Armar mi PC'}
          </Button>

          {error && (
            <Alert severity='error'>{error}</Alert>
          )}
        </Box>
      )}

      {/* Result */}
      {result && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant='outlined' onClick={reset} startIcon={<i className='ri-refresh-line' />}>
              Nueva configuración
            </Button>
          </Box>
          <BuildResult result={result} />
        </Box>
      )}
    </Box>
  )
}

export default BuilderPage
