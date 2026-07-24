'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

import CompanyLogo from './CompanyLogo'

const CompanyCard = ({ item, onView, onEdit }) => {
  const hasScrape = Boolean(item.scrapeConfig && Object.keys(item.scrapeConfig).length)

  return (
    <Card variant='outlined' sx={{ height: '100%' }}>
      <CardContent className='flex flex-col gap-4' sx={{ height: '100%' }}>
        <Box className='flex items-start justify-between gap-3'>
          <Box className='flex items-center gap-3 min-is-0'>
            <CompanyLogo
              src={item.logoUrl}
              alt={item.name}
              size={44}
              darkBg={item.logoDarkBg}
              bgColor={item.logoBgColor}
            />
            <Box className='min-is-0'>
              <Typography variant='h6' className='font-medium truncate'>
                {item.name}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {item.slug}
              </Typography>
            </Box>
          </Box>
          <Chip
            size='small'
            variant='tonal'
            color={item.active ? 'success' : 'default'}
            label={item.active ? 'Activa' : 'Inactiva'}
          />
        </Box>

        <Chip
          size='small'
          variant='tonal'
          color={hasScrape ? 'info' : 'warning'}
          label={hasScrape ? 'Scrape configurado' : 'Sin config scrape'}
          sx={{ alignSelf: 'flex-start' }}
        />

        {item.website ? (
          <Typography
            component='a'
            href={item.website}
            target='_blank'
            rel='noreferrer'
            variant='body2'
            color='primary'
            sx={{ flex: 1, wordBreak: 'break-all' }}
          >
            {item.website.replace(/^https?:\/\//, '')}
          </Typography>
        ) : (
          <Typography variant='body2' color='text.disabled' sx={{ flex: 1 }}>
            Sin sitio web
          </Typography>
        )}

        <Box className='flex gap-2'>
          <Button
            variant='outlined'
            fullWidth
            startIcon={<i className='ri-eye-line' />}
            onClick={() => onView(item)}
          >
            Ver
          </Button>
          <Button
            variant='contained'
            fullWidth
            startIcon={<i className='ri-edit-box-line' />}
            onClick={() => onEdit(item)}
          >
            Editar
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CompanyCard
