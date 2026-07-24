'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

const BuildResult = ({ result }) => {
  if (!result) return null

  const { components, totalPrice, compatibility, explanation, futureUpgrades } = result

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Explanation */}
      <Card variant='outlined'>
        <CardContent>
          <Typography variant='h6' fontWeight={700} gutterBottom>
            <i className='ri-sparkling-line' style={{ marginRight: 8, color: 'var(--mui-palette-primary-main)' }} />
            Tu PC armada
          </Typography>
          <Typography variant='body1'>{explanation}</Typography>
          <Typography variant='h5' color='primary.main' fontWeight={700} sx={{ mt: 2 }}>
            Total: S/ {totalPrice?.toLocaleString('es-PE')}
          </Typography>
        </CardContent>
      </Card>

      {/* Components table */}
      <Card variant='outlined'>
        <CardContent>
          <Typography variant='subtitle1' fontWeight={700} gutterBottom>
            Componentes seleccionados
          </Typography>

          <Table size='medium'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Componente</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Modelo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Marca</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align='right'>Precio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {components?.map((comp, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ fontWeight: 600 }}>{comp.category}</TableCell>
                  <TableCell>
                    <Typography variant='body2'>{comp.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{comp.reason}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{comp.brand}</Typography>
                    {comp.tier && (
                      <Typography variant='caption' color='primary.main' fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                        Gama {comp.tier}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align='right'>
                    <Typography variant='body2' fontWeight={600}>
                      S/ {comp.price?.toLocaleString('es-PE')}
                    </Typography>
                    <Typography variant='caption' color={comp.source === 'database' ? 'success.main' : 'text.secondary'}>
                      {comp.source === 'database' ? 'Precio real' : 'Estimado'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Compatibility checks */}
      {compatibility?.length > 0 && (
        <Card variant='outlined'>
          <CardContent>
            <Typography variant='subtitle1' fontWeight={700} gutterBottom>
              <i className='ri-checkbox-circle-fill' style={{ marginRight: 6, color: 'var(--mui-palette-success-main)' }} />
              Validación de compatibilidad
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {compatibility.map((check, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='ri-checkbox-circle-fill' style={{ color: 'var(--mui-palette-success-main)', fontSize: '1.1rem' }} />
                  <Typography variant='body2'>{check}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Future upgrades */}
      {futureUpgrades?.length > 0 && (
        <Card variant='outlined'>
          <CardContent>
            <Typography variant='subtitle1' fontWeight={700} gutterBottom>
              <i className='ri-arrow-up-circle-line' style={{ marginRight: 6, color: 'var(--mui-palette-info-main)' }} />
              Mejoras futuras
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {futureUpgrades.map((upg, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='ri-add-line' style={{ color: 'var(--mui-palette-info-main)', fontSize: '1.1rem' }} />
                  <Typography variant='body2'>{upg}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default BuildResult
