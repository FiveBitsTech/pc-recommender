'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const TIER_CONFIG = {
  0: { label: 'Económica', color: 'success', icon: 'ri-leaf-line' },
  1: { label: 'Recomendada ⭐', color: 'primary', icon: 'ri-thumb-up-line' },
  2: { label: 'Mejor opción', color: 'warning', icon: 'ri-vip-crown-line' },
}

const ResultCard = ({ recommendation, index, isSelected, onSelect }) => {
  const { product, score, reason } = recommendation
  const tier = TIER_CONFIG[index] || TIER_CONFIG[2]

  return (
    <Card
      variant='outlined'
      sx={{
        borderColor: isSelected ? 'primary.main' : index === 1 ? 'primary.main' : 'divider',
        borderWidth: isSelected || index === 1 ? 2 : 1,
        position: 'relative',
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      {/* Tier badge */}
      <Chip
        label={tier.label}
        color={tier.color}
        size='small'
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          fontWeight: 600,
          fontSize: '0.8rem',
        }}
      />

      <CardActionArea onClick={() => onSelect(recommendation)}>
        <CardContent sx={{ pt: 5, pb: 2, px: 2.5 }}>
          {/* Product image placeholder */}
          <Box
            sx={{
              width: '100%',
              height: 130,
              bgcolor: 'action.hover',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <i className={product.category === 'laptop' ? 'ri-macbook-line' : 'ri-computer-line'} style={{ fontSize: '3.5rem', opacity: 0.4 }} />
          </Box>

          {/* Product name */}
          <Typography variant='subtitle1' fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {product.name}
          </Typography>

          {/* Price */}
          <Typography variant='h5' color='primary.main' fontWeight={700} sx={{ mt: 0.5 }}>
            S/ {product.price?.toLocaleString('es-PE') || '---'}
          </Typography>

          {/* Price verdict badge */}
          {recommendation.priceVerdict && (
            <Chip
              label={recommendation.priceVerdict}
              size='small'
              color={recommendation.overpriced ? 'error' : 'success'}
              variant='outlined'
              sx={{ mt: 0.5, fontSize: '0.7rem' }}
            />
          )}

          {/* Store + stock */}
          {product.company && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <i className='ri-store-2-line' style={{ fontSize: '1rem' }} />
              <Typography variant='body2' color='text.secondary'>
                {product.company.name}
              </Typography>
              <Chip label='En stock' size='small' color='success' variant='outlined' sx={{ ml: 'auto', height: 22, fontSize: '0.75rem' }} />
            </Box>
          )}

          {/* Key specs */}
          {product.specs && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {product.specs.processor && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <i className='ri-cpu-line' style={{ fontSize: '1rem', opacity: 0.6 }} />
                  <Typography variant='body2'>{product.specs.processor}</Typography>
                </Box>
              )}
              {product.specs.ram && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <i className='ri-ram-line' style={{ fontSize: '1rem', opacity: 0.6 }} />
                  <Typography variant='body2'>{product.specs.ram}</Typography>
                </Box>
              )}
              {product.specs.storage && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <i className='ri-hard-drive-3-line' style={{ fontSize: '1rem', opacity: 0.6 }} />
                  <Typography variant='body2'>{product.specs.storage}</Typography>
                </Box>
              )}
              {product.specs.screen && product.specs.screen !== 'N/A' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <i className='ri-monitor-line' style={{ fontSize: '1rem', opacity: 0.6 }} />
                  <Typography variant='body2'>{product.specs.screen}</Typography>
                </Box>
              )}
            </Box>
          )}

          {/* AI Reason */}
          {reason && (
            <Typography variant='body2' color='text.secondary' sx={{ mt: 2, display: 'block', fontStyle: 'italic', lineHeight: 1.5 }}>
              💡 {reason}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>

      {/* View details button */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Button
          fullWidth
          variant={isSelected ? 'contained' : 'outlined'}
          size='medium'
          onClick={() => onSelect(recommendation)}
        >
          Ver detalles
        </Button>
      </Box>
    </Card>
  )
}

export default ResultCard
