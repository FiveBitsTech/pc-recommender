'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import { alpha } from '@mui/material/styles'

import { USAGE_OPTIONS, PROGRAMMING_SUBOPTIONS, DESIGN_SUBOPTIONS } from '../utils/chatSteps'

const SUB_OPTIONS_MAP = {
  'programación': PROGRAMMING_SUBOPTIONS,
  'diseño gráfico': DESIGN_SUBOPTIONS,
}

const StepUsage = ({ value, detailValue, onChange, onNext, onPrev }) => {
  const [showSubOptions, setShowSubOptions] = useState(!!value && SUB_OPTIONS_MAP[value])

  const handleSelectUsage = (usageValue) => {
    onChange('usageType', usageValue)
    onChange('usageDetail', null)

    if (SUB_OPTIONS_MAP[usageValue]) {
      setShowSubOptions(true)
    } else {
      setShowSubOptions(false)
      onNext()
    }
  }

  const handleSelectDetail = (detail) => {
    onChange('usageDetail', detail)
    onNext()
  }

  const subOptions = value ? SUB_OPTIONS_MAP[value] : null

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
      <Typography variant='h5' fontWeight={700} textAlign='center' gutterBottom>
        ¿Para qué la utilizarás?
      </Typography>
      <Typography variant='body1' color='text.secondary' textAlign='center' sx={{ mb: 4 }}>
        Esto nos ayuda a recomendar las mejores especificaciones
      </Typography>

      {/* Main usage options */}
      {!showSubOptions && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {USAGE_OPTIONS.map((option) => {
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
                <CardActionArea onClick={() => handleSelectUsage(option.value)}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isSelected
                          ? (theme) => alpha(theme.palette.primary.main, 0.12)
                          : 'action.hover',
                      }}
                    >
                      <i className={option.icon} style={{ fontSize: '1.25rem' }} />
                    </Box>
                    <Box>
                      <Typography variant='body1' fontWeight={600}>
                        {option.label}
                      </Typography>
                      {option.description && (
                        <Typography variant='caption' color='text.secondary'>
                          {option.description}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            )
          })}
        </Box>
      )}

      {/* Sub-options for specific usage types */}
      {showSubOptions && subOptions && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Button variant='text' size='small' onClick={() => setShowSubOptions(false)} startIcon={<i className='ri-arrow-left-line' />}>
              Cambiar uso
            </Button>
            <Chip label={value} size='small' color='primary' variant='outlined' />
          </Box>

          <Typography variant='subtitle1' fontWeight={600} gutterBottom>
            ¿Qué tipo específicamente?
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
            {subOptions.map((sub) => {
              const isSelected = detailValue === sub.value

              return (
                <Card
                  key={sub.value}
                  variant='outlined'
                  sx={{
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                  }}
                >
                  <CardActionArea onClick={() => handleSelectDetail(sub.value)}>
                    <CardContent sx={{ py: 1.5 }}>
                      <Typography variant='body2' fontWeight={isSelected ? 600 : 400}>
                        {sub.label}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              )
            })}
          </Box>
        </Box>
      )}

      {/* Back button */}
      {!showSubOptions && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
          <Button variant='text' onClick={onPrev} startIcon={<i className='ri-arrow-left-line' />}>
            Atrás
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default StepUsage
