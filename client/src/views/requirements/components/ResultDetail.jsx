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

  const { product, score, reason, advantages, disadvantages, limitations, upgradeOptions } = recommendation
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
        <Typography variant='h5' fontWeight={700} gutterBottom>
          ¿Por qué recomendamos esta opción?
        </Typography>
        {reason && (
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2.5, mb: 3 }}>
            <Typography variant='body1'>{reason}</Typography>
          </Box>
        )}

        {/* Advantages & Disadvantages */}
        {(advantages?.length > 0 || disadvantages?.length > 0) && (
          <>
            <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
              {advantages?.length > 0 && (
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography variant='subtitle1' fontWeight={700} color='success.main' gutterBottom>
                    Ventajas
                  </Typography>
                  {advantages.map((adv, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <i className='ri-add-circle-fill' style={{ color: 'var(--mui-palette-success-main)', marginTop: 3, flexShrink: 0, fontSize: '1.1rem' }} />
                      <Typography variant='body1'>{adv}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
              {disadvantages?.length > 0 && (
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography variant='subtitle1' fontWeight={700} color='error.main' gutterBottom>
                    Desventajas
                  </Typography>
                  {disadvantages.map((dis, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <i className='ri-indeterminate-circle-fill' style={{ color: 'var(--mui-palette-error-main)', marginTop: 3, flexShrink: 0, fontSize: '1.1rem' }} />
                      <Typography variant='body1'>{dis}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Divider sx={{ mb: 3 }} />
          </>
        )}

        {/* Limitations */}
        {limitations?.length > 0 && (
          <>
            <Typography variant='subtitle1' fontWeight={700} gutterBottom>
              <i className='ri-error-warning-line' style={{ marginRight: 6, color: 'var(--mui-palette-warning-main)' }} />
              Limitaciones técnicas
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
              Restricciones a tener en cuenta para el futuro
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              {limitations.map((lim, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <i className='ri-alert-fill' style={{ color: 'var(--mui-palette-warning-main)', marginTop: 3, flexShrink: 0, fontSize: '1.1rem' }} />
                  <Typography variant='body1'>{lim}</Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ mb: 3 }} />
          </>
        )}

        {/* Upgrade Options */}
        {upgradeOptions?.length > 0 && (
          <>
            <Typography variant='subtitle1' fontWeight={700} gutterBottom>
              <i className='ri-arrow-up-circle-line' style={{ marginRight: 6, color: 'var(--mui-palette-info-main)' }} />
              Mejoras futuras posibles
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
              Componentes que puedes actualizar posteriormente
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              {upgradeOptions.map((upg, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <i className='ri-add-line' style={{ color: 'var(--mui-palette-info-main)', marginTop: 3, flexShrink: 0, fontSize: '1.1rem' }} />
                  <Typography variant='body1'>{upg}</Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ mb: 3 }} />
          </>
        )}

        {/* Especificaciones completas */}
        <Typography variant='subtitle1' fontWeight={700} gutterBottom>
          Especificaciones completas
        </Typography>

        <Table size='medium' sx={{ mb: 3 }}>
          <TableBody>
            {specRows.map((row) => (
              <TableRow key={row.label}>
                <TableCell sx={{ fontWeight: 600, width: 180, fontSize: '0.95rem', borderBottom: '1px solid', borderColor: 'divider' }}>
                  {row.label}
                </TableCell>
                <TableCell sx={{ fontSize: '0.95rem', borderBottom: '1px solid', borderColor: 'divider' }}>
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
              size='large'
              href={product.productUrl}
              target='_blank'
              startIcon={<i className='ri-external-link-line' />}
            >
              Ver en la tienda
            </Button>
          )}
          <Button variant='outlined' size='large' startIcon={<i className='ri-scales-3-line' />}>
            Agregar a comparar
          </Button>
          <Button variant='outlined' size='large' startIcon={<i className='ri-bookmark-line' />}>
            Guardar para después
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ResultDetail
