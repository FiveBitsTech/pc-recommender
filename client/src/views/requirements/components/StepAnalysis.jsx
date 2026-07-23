'use client'

import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import { ANALYSIS_STEPS } from '../utils/chatSteps'

const StepAnalysis = () => {
  const [completedSteps, setCompletedSteps] = useState([])

  useEffect(() => {
    const timers = ANALYSIS_STEPS.map((_, index) =>
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, index])
      }, (index + 1) * 550)
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <Box sx={{ maxWidth: 450, mx: 'auto', py: 6, textAlign: 'center' }}>
      <CircularProgress size={56} thickness={3} sx={{ mb: 3 }} />

      <Typography variant='h5' fontWeight={700} gutterBottom>
        Analizando tu recomendación...
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        Esto tomará solo unos segundos
      </Typography>

      <Box sx={{ textAlign: 'left', maxWidth: 300, mx: 'auto' }}>
        {ANALYSIS_STEPS.map((step, index) => {
          const isDone = completedSteps.includes(index)

          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1,
                opacity: isDone ? 1 : 0.4,
                transition: 'opacity 0.3s',
              }}
            >
              {isDone ? (
                <i className='ri-checkbox-circle-fill' style={{ fontSize: '1.25rem', color: 'var(--mui-palette-success-main)' }} />
              ) : (
                <i className='ri-loader-4-line' style={{ fontSize: '1.25rem' }} />
              )}
              <Typography variant='body2' fontWeight={isDone ? 500 : 400}>
                {step}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default StepAnalysis
