'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import { alpha } from '@mui/material/styles'

import { PRIORITY_OPTIONS, BRAND_PREFERENCE_OPTIONS } from '../utils/chatSteps'

const StepBudget = ({ formData, onChange, onSubmit, onPrev, isSubmitting }) => {
  const handleBudgetChange = (e) => {
    const val = parseInt(e.target.value, 10)

    onChange('budget', isNaN(val) ? 0 : val)
  }

  return (
    <Box sx={{ maxWidth: 550, mx: 'auto', py: 4 }}>
      <Typography variant='h5' fontWeight={700} textAlign='center' gutterBottom>
        ¿Cuánto deseas invertir?
      </Typography>
      <Typography variant='body1' color='text.secondary' textAlign='center' sx={{ mb: 4 }}>
        Esto nos permite filtrar opciones dentro de tu rango
      </Typography>

      {/* Budget input */}
      <TextField
        fullWidth
        label='Presupuesto'
        type='number'
        value={formData.budget || ''}
        onChange={handleBudgetChange}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position='start'>S/</InputAdornment>,
          },
        }}
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.budgetFlexible}
            onChange={(e) => onChange('budgetFlexible', e.target.checked)}
          />
        }
        label='Tengo presupuesto flexible'
        sx={{ mb: 4 }}
      />

      {/* Priority */}
      <Typography variant='subtitle1' fontWeight={600} gutterBottom>
        ¿Qué prefieres?
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        Selecciona tu prioridad principal
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 4 }}>
        {PRIORITY_OPTIONS.map((option) => {
          const isSelected = formData.priority === option.value

          return (
            <Card
              key={option.value}
              variant='outlined'
              sx={{
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.04) : 'background.paper',
              }}
            >
              <CardActionArea onClick={() => onChange('priority', option.value)}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
                  <i className={option.icon} style={{ fontSize: '1.25rem' }} />
                  <Typography variant='body2' fontWeight={isSelected ? 600 : 400}>
                    {option.label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          )
        })}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Brand preference — optional */}
      <Typography variant='subtitle1' fontWeight={600} gutterBottom>
        ¿Tienes preferencia de procesador?
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        Opcional — si ya sabes qué marca prefieres
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mb: 4 }}>
        {BRAND_PREFERENCE_OPTIONS.map((option) => {
          const isSelected = formData.brandPreference === option.value

          return (
            <Card
              key={option.label}
              variant='outlined'
              sx={{
                borderColor: isSelected ? 'primary.main' : 'divider',
                borderWidth: isSelected ? 2 : 1,
                bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.04) : 'background.paper',
              }}
            >
              <CardActionArea onClick={() => onChange('brandPreference', option.value)}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, py: 2, textAlign: 'center' }}>
                  <i className={option.icon} style={{ fontSize: '1.5rem' }} />
                  <Typography variant='body2' fontWeight={isSelected ? 700 : 500}>
                    {option.label}
                  </Typography>
                  {option.description && (
                    <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.3 }}>
                      {option.description}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          )
        })}
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant='text' onClick={onPrev} startIcon={<i className='ri-arrow-left-line' />}>
          Atrás
        </Button>
        <Button
          variant='contained'
          size='large'
          onClick={onSubmit}
          disabled={!formData.budget || formData.budget < 500 || isSubmitting}
          endIcon={<i className='ri-sparkling-line' />}
        >
          Buscar recomendaciones
        </Button>
      </Box>
    </Box>
  )
}

export default StepBudget
