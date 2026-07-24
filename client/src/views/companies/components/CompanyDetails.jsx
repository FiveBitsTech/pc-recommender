'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import CompanyLogo from './CompanyLogo'

const Row = ({ label, children }) => (
  <Box className='flex flex-col gap-1'>
    <Typography variant='caption' color='text.secondary'>
      {label}
    </Typography>
    {children}
  </Box>
)

const CompanyDetails = ({ open, company, onClose, onEdit }) => {
  if (!company) return null

  const scrapeText = company.scrapeConfig
    ? JSON.stringify(company.scrapeConfig, null, 2)
    : 'Sin scrapeConfig'

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 440 } } }}
    >
      <Box className='flex items-center justify-between p-5 border-be'>
        <Typography variant='h5'>Detalle</Typography>
        <IconButton size='small' onClick={onClose}>
          <i className='ri-close-line' />
        </IconButton>
      </Box>

      <Box className='flex flex-col gap-5 p-5 flex-1 overflow-y-auto'>
        <Box className='flex items-center gap-3'>
          <CompanyLogo
            src={company.logoUrl}
            alt={company.name}
            size={48}
            darkBg={company.logoDarkBg}
            bgColor={company.logoBgColor}
          />
          <Box>
            <Typography variant='h6'>{company.name}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {company.slug}
            </Typography>
          </Box>
        </Box>

        <Row label='Estado'>
          <Chip
            size='small'
            label={company.active ? 'Activa' : 'Inactiva'}
            color={company.active ? 'success' : 'default'}
            variant='tonal'
            sx={{ alignSelf: 'flex-start' }}
          />
        </Row>

        <Row label='Sitio web'>
          {company.website ? (
            <Typography
              component='a'
              href={company.website}
              target='_blank'
              rel='noreferrer'
              color='primary'
            >
              {company.website}
            </Typography>
          ) : (
            <Typography color='text.disabled'>—</Typography>
          )}
        </Row>

        <Row label='scrapeConfig'>
          <Box
            component='pre'
            sx={{
              m: 0,
              p: 2,
              borderRadius: 1,
              bgcolor: 'action.hover',
              fontSize: 12,
              overflow: 'auto',
              maxHeight: 320
            }}
          >
            {scrapeText}
          </Box>
        </Row>
      </Box>

      <Box className='flex items-center justify-between gap-3 p-5 border-bs'>
        <Button variant='tonal' color='secondary' onClick={onClose}>
          Cerrar
        </Button>
        <Button variant='contained' startIcon={<i className='ri-edit-box-line' />} onClick={() => onEdit(company)}>
          Editar
        </Button>
      </Box>
    </Drawer>
  )
}

export default CompanyDetails
