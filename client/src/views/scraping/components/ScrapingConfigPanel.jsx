'use client'

import { useState } from 'react'

import { LoadingButton } from '@mui/lab'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'

import {
  notificationErrorMessage,
  notificationSuccesMessage
} from '@/components/ToastNotification'

import { useClearScrapingCatalogMutation } from '../api/scrapingApi'

const CATALOG_ITEMS = [
  { key: 'products', label: 'Productos', icon: 'ri-box-3-line' },
  { key: 'prices', label: 'Precios', icon: 'ri-money-dollar-circle-line' },
  { key: 'specs', label: 'Especificaciones', icon: 'ri-cpu-line' },
  { key: 'tagRelations', label: 'Relaciones de etiquetas', icon: 'ri-link' },
  { key: 'tags', label: 'Etiquetas', icon: 'ri-price-tag-3-line' },
  { key: 'comparisons', label: 'Comparaciones', icon: 'ri-scales-3-line' },
  { key: 'recommendations', label: 'Recomendaciones', icon: 'ri-thumb-up-line' }
]

const ScrapingConfigPanel = () => {
  const [clearProducts, setClearProducts] = useState(true)
  const [clearHistory, setClearHistory] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clearCatalog, { isLoading }] = useClearScrapingCatalogMutation()

  const handleClear = async () => {
    try {
      await clearCatalog({ clearProducts, clearHistory }).unwrap()
      notificationSuccesMessage('Catálogo limpiado')
      setConfirmOpen(false)
    } catch (err) {
      const msg = Array.isArray(err?.data?.message)
        ? err.data.message.join(', ')
        : err?.data?.message || err?.error || 'No se pudo limpiar'
      notificationErrorMessage(msg)
    }
  }

  return (
    <Card>
      <CardContent className='flex flex-col gap-4'>
        <div>
          <Typography variant='h5' className='mbe-1'>
            Configuración de scraping
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Limpia el catálogo scrapeado sin tocar las empresas.
          </Typography>
        </div>

        <Alert severity='warning'>
          Al limpiar catálogo se vacían productos, precios, specs, etiquetas, comparaciones y
          recomendaciones. Las empresas no se tocan.
        </Alert>

        <div className='flex flex-col gap-1'>
          <FormControlLabel
            control={<Checkbox checked={clearProducts} onChange={e => setClearProducts(e.target.checked)} />}
            label='Borrar catálogo scrapeado'
          />
          <FormControlLabel
            control={<Checkbox checked={clearHistory} onChange={e => setClearHistory(e.target.checked)} />}
            label='Borrar historial de scraping'
          />
        </div>

        <div>
          <Button
            color='error'
            variant='outlined'
            disabled={(!clearProducts && !clearHistory) || isLoading}
            startIcon={<i className='ri-delete-bin-line' />}
            onClick={() => setConfirmOpen(true)}
          >
            Limpiar catálogo
          </Button>
        </div>
      </CardContent>

      <Dialog
        open={confirmOpen}
        onClose={() => !isLoading && setConfirmOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle className='flex flex-col items-center gap-3 text-center pbs-8 pbe-4'>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'error.lightOpacity',
              color: 'error.main'
            }}
          >
            <i className='ri-error-warning-line text-3xl' />
          </Avatar>
          <div>
            <Typography variant='h5' component='span' className='block'>
              ¿Limpiar datos de scraping?
            </Typography>
            <Typography variant='body2' color='text.secondary' className='mbs-1'>
              Esta acción no se puede deshacer
            </Typography>
          </div>
        </DialogTitle>

        <DialogContent className='flex flex-col gap-4 pis-6 pie-6'>
          {clearProducts ? (
            <div>
              <Typography variant='subtitle2' className='mbe-2'>
                Se eliminará
              </Typography>
              <div className='flex flex-wrap gap-2'>
                {CATALOG_ITEMS.map(item => (
                  <Chip
                    key={item.key}
                    size='small'
                    variant='tonal'
                    color='error'
                    icon={<i className={item.icon} />}
                    label={item.label}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {clearHistory ? (
            <Alert severity='info' icon={<i className='ri-history-line' />}>
              También se vaciará el historial de scraping
            </Alert>
          ) : null}

          <Divider />

          <Typography variant='body2' color='text.secondary'>
            Las empresas registradas se mantienen intactas.
          </Typography>
        </DialogContent>

        <DialogActions className='gap-2 p-6 pbs-2'>
          <Button variant='tonal' color='secondary' onClick={() => setConfirmOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <LoadingButton
            color='error'
            variant='contained'
            loading={isLoading}
            startIcon={<i className='ri-delete-bin-line' />}
            onClick={handleClear}
          >
            Sí, limpiar todo
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ScrapingConfigPanel
