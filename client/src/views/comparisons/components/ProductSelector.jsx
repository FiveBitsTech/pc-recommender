'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

const ProductSelector = ({ index, products, selected, onSelect, onRemove }) => {
  const label = index === 0 ? 'Producto 1' : 'Producto 2'

  return (
    <Card variant='outlined' sx={{ flex: 1, minWidth: 280 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='subtitle1' fontWeight={600}>
            {label}
          </Typography>
          {selected && (
            <IconButton size='small' onClick={() => onRemove(index)}>
              <i className='ri-close-line' />
            </IconButton>
          )}
        </Box>

        {!selected ? (
          <Autocomplete
            options={products}
            getOptionLabel={(option) => `${option.name} - S/${Number(option.latestPrice?.price ?? 0).toLocaleString('es-PE')}`}
            onChange={(_, value) => onSelect(index, value)}
            renderInput={(params) => <TextField {...params} label='Buscar producto...' size='small' />}
            noOptionsText='No se encontraron productos'
          />
        ) : (
          <Box>
            {/* Product image placeholder */}
            <Box
              sx={{
                width: '100%',
                height: 100,
                bgcolor: 'action.hover',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <i className={selected.category === 'laptop' ? 'ri-macbook-line' : 'ri-computer-line'} style={{ fontSize: '2.5rem', opacity: 0.4 }} />
            </Box>

            <Typography variant='subtitle2' fontWeight={700}>
              {selected.name}
            </Typography>
            <Typography variant='h6' color='primary.main' fontWeight={700}>
              S/ {Number(selected.latestPrice?.price ?? 0).toLocaleString('es-PE')}
            </Typography>

            {selected.specs && (
              <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {selected.specs.processor && (
                  <Typography variant='body2'>CPU: {selected.specs.processor}</Typography>
                )}
                {selected.specs.ram && (
                  <Typography variant='body2'>RAM: {selected.specs.ram}</Typography>
                )}
                {selected.specs.gpu && (
                  <Typography variant='body2'>GPU: {selected.specs.gpu}</Typography>
                )}
                {selected.specs.storage && (
                  <Typography variant='body2'>Disco: {selected.specs.storage}</Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default ProductSelector
