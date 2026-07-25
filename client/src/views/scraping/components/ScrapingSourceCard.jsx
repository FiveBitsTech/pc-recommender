'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { LoadingButton } from '@mui/lab'

import CompanyLogo from '@/views/companies/components/CompanyLogo'

import ScrapingRunProgress from './ScrapingRunProgress'
import runButtonSx from './runButtonSx'

const ScrapingSourceCard = ({ card, running, disabled, progress, onRun }) => (
  <Card variant='outlined' sx={{ height: '100%' }}>
    <CardContent className='flex flex-col gap-4' sx={{ height: '100%' }}>
      <Box className='flex items-start justify-between gap-3'>
        <Box className='flex items-center gap-3'>
          <CompanyLogo
            src={card.logoUrl}
            alt={card.title}
            size={44}
            darkBg={card.logoDarkBg}
            bgColor={card.logoBgColor}
          />
          <Box>
            <Typography variant='h6' className='font-medium'>
              {card.title}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {card.source}
            </Typography>
          </Box>
        </Box>
        <Chip
          size='small'
          variant='tonal'
          color={card.active ? 'success' : 'default'}
          label={card.active ? 'Activa' : 'Inactiva'}
        />
      </Box>

      <Typography variant='body2' color='text.secondary' sx={{ flex: 1 }}>
        {card.description}
      </Typography>

      {card.website ? (
        <Typography component='a' href={card.website} target='_blank' rel='noreferrer' variant='body2' color='primary'>
          {card.website.replace(/^https?:\/\//, '')}
        </Typography>
      ) : null}

      {running && progress ? <ScrapingRunProgress progress={progress} compact /> : null}

      <LoadingButton
        variant='contained'
        fullWidth
        loading={running}
        loadingPosition='start'
        disabled={disabled || !card.canRun}
        startIcon={<i className='ri-play-circle-line' />}
        onClick={() => onRun(card.companyId)}
        sx={runButtonSx}
      >
        Ejecutar scraping
      </LoadingButton>
    </CardContent>
  </Card>
)

export default ScrapingSourceCard
