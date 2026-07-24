'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const CompanyEmptyState = ({ onCreate, hasSearch }) => (
  <Box className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
    <i className='ri-building-line' style={{ fontSize: '3rem', opacity: 0.35 }} />
    <Typography variant='h6'>
      {hasSearch ? 'Sin resultados' : 'Aún no hay empresas'}
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 420 }}>
      {hasSearch
        ? 'Prueba con otro nombre o slug.'
        : 'Registra tiendas a scrapear y define su scrapeConfig para el catálogo.'}
    </Typography>
    {!hasSearch && (
      <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onCreate}>
        Nueva empresa
      </Button>
    )}
  </Box>
)

export default CompanyEmptyState
