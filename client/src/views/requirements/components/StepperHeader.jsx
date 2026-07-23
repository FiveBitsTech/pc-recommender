'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { STEPPER_LABELS } from '../utils/chatSteps'

const StepperHeader = ({ currentStep, formData, onStepClick }) => {
  const summaryTexts = [
    formData.deviceType === 'laptop' ? 'Laptop' : formData.deviceType === 'desktop' ? 'PC completa' : formData.deviceType,
    formData.usageType,
    formData.budget ? `S/ ${formData.budget.toLocaleString('es-PE')}` : null,
    null,
  ]

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 1, md: 2 },
        py: 2,
        px: 3,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px 12px 0 0',
        flexWrap: 'wrap',
      }}
    >
      {STEPPER_LABELS.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep
        const isClickable = index < currentStep

        return (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Step circle */}
            <Box
              onClick={isClickable ? () => onStepClick(index) : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: isClickable ? 'pointer' : 'default',
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: isActive
                  ? (theme) => alpha(theme.palette.primary.main, 0.1)
                  : isCompleted
                    ? (theme) => alpha(theme.palette.success.main, 0.08)
                    : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'primary.main' : isCompleted ? 'success.main' : 'divider',
                transition: 'all 0.2s',
                '&:hover': isClickable
                  ? { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }
                  : {},
              }}
            >
              {/* Number / Check */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isActive ? 'primary.main' : isCompleted ? 'success.main' : 'action.hover',
                  color: isActive || isCompleted ? 'white' : 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {isCompleted ? <i className='ri-check-line' /> : index + 1}
              </Box>

              {/* Label */}
              <Box>
                <Typography
                  variant='caption'
                  fontWeight={isActive ? 600 : 400}
                  color={isActive ? 'primary.main' : isCompleted ? 'success.main' : 'text.secondary'}
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  {step.label}
                </Typography>
                {isCompleted && summaryTexts[index] && (
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.2 }}>
                    {summaryTexts[index]}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Connector */}
            {index < STEPPER_LABELS.length - 1 && (
              <Box
                sx={{
                  width: 24,
                  height: 2,
                  bgcolor: index < currentStep ? 'success.main' : 'divider',
                  display: { xs: 'none', md: 'block' },
                }}
              />
            )}
          </Box>
        )
      })}
    </Box>
  )
}

export default StepperHeader
