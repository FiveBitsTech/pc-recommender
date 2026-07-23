'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

const ResultDetail = ({ recommendation }) => {
  if (!recommendation) return null

  const { product, score, reason, advantages, disadvantages } = recommendation
  const { specs, company } = product

  const specRows = specs
    ? [
        { label: 'Procesador', value: specs.processor },
        { label: 'RAM', value: specs.ram },
        { label: 'Almacenamiento', value: specs.storage },
        { label: 'Gráficos', value: specs.gpu },
        { label: 'Pantalla', value: specs.screen },
        { label: 'Sistema Operativo', value: specs.operatingSystem },
      ].filter((r) => r.value && r.value !== 'N/A')
    : []

  return (
    <Card variant='outlined'>
      <CardContent sx={{ p: 3 }}>
        {/* Why section */}
        <Typography variant='h6' fontWeight={700} gutterBottom>
          ¿Por qué recomendamos esta opción?
        </Typography>
        {reason && (
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2, mb: 3 }}>
            <Typography variant='body2'>{reason}</Typography>
          </Box>
        )}

        {/* Advantages & Disadvantages */}
        {(advantages?.length > 0 || disadvantages?.length > 0) && (
          <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            {advantages?.length > 0 && (
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant='subtitle2' fontWeight={600} color='success.main' gutterBottom>
                  Ventajas
                </Typography>
                {advantages.map((adv, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                    <i className='ri-add-circle-fill' style={{ color: 'var(--mui-palette-success-main)', marginTop: 2, flexShrink: 0 }} />
                    <Typography variant='body2'>{adv}</Typography>
                  </Box>
                ))}
              </Box>
            )}
            {disadvantages?.length > 0 && (
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant='subtitle2' fontWeight={600} color='error.main' gutterBottom>
                  Desventajas
                </Typography>
                {disadvantages.map((dis, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                    <i className='ri-indeterminate-circle-fill' style={{ color: 'var(--mui-palette-error-main)', marginTop: 2, flexShrink: 0 }} />
                    <Typography variant='body2'>{dis}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Specs table */}
        <Typography variant='subtitle2' fontWeight={600} gutterBottom>
          Especificaciones completas
        </Typography>

        <Table size='small' sx={{ mb: 3 }}>
          <TableBody>
            {specRows.map((row) => (
              <TableRow key={row.label}>
                <TableCell sx={{ fontWeight: 600, width: 160, borderBottom: '1px solid', borderColor: 'divider' }}>
                  {row.label}
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  {row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ mb: 3 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {product.productUrl && (
            <Button
              variant='contained'
              href={product.productUrl}
              target='_blank'
              startIcon={<i className='ri-external-link-line' />}
            >
              Ver en la tienda
            </Button>
          )}
          <Button variant='outlined' startIcon={<i className='ri-scales-3-line' />}>
            Agregar a comparar
          </Button>
          <Button variant='outlined' startIcon={<i className='ri-bookmark-line' />}>
            Guardar para después
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ResultDetail
