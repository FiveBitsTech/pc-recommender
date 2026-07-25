'use client'

import { useEffect, useState } from 'react'

import { LoadingButton } from '@mui/lab'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import {
  notificationErrorMessage,
  notificationSuccesMessage
} from '@/components/ToastNotification'

import { useGetAdminProductQuery, useUpdateAdminProductMutation } from '../api/adminCatalogApi'

const emptyForm = {
  name: '',
  brand: '',
  model: '',
  category: '',
  productUrl: '',
  imageUrl: '',
  externalSku: '',
  processor: '',
  gpu: '',
  ram: '',
  storage: '',
  screen: '',
  operatingSystem: ''
}

const ProductDrawer = ({ open, productId, onClose }) => {
  const { data, isLoading } = useGetAdminProductQuery(productId, { skip: !open || !productId })
  const [updateProduct, updateState] = useUpdateAdminProductMutation()
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!data) return
    setForm({
      name: data.name || '',
      brand: data.brand || '',
      model: data.model || '',
      category: data.category || '',
      productUrl: data.productUrl || '',
      imageUrl: data.imageUrl || '',
      externalSku: data.externalSku || '',
      processor: data.specs?.processor || '',
      gpu: data.specs?.gpu || '',
      ram: data.specs?.ram || '',
      storage: data.specs?.storage || '',
      screen: data.specs?.screen || '',
      operatingSystem: data.specs?.operatingSystem || ''
    })
  }, [data])

  const setField = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSave = async () => {
    try {
      await updateProduct({
        id: productId,
        name: form.name.trim(),
        brand: form.brand.trim() || null,
        model: form.model.trim() || null,
        category: form.category.trim() || null,
        productUrl: form.productUrl.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        externalSku: form.externalSku.trim() || null,
        specs: {
          processor: form.processor.trim() || null,
          gpu: form.gpu.trim() || null,
          ram: form.ram.trim() || null,
          storage: form.storage.trim() || null,
          screen: form.screen.trim() || null,
          operatingSystem: form.operatingSystem.trim() || null
        }
      }).unwrap()
      notificationSuccesMessage('Producto actualizado')
      onClose()
    } catch (err) {
      const msg = Array.isArray(err?.data?.message)
        ? err.data.message.join(', ')
        : err?.data?.message || err?.error || 'No se pudo guardar'
      notificationErrorMessage(msg)
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 440 } } }}
    >
      <div className='flex items-center justify-between p-5 border-be'>
        <Typography variant='h5'>Producto</Typography>
        <IconButton onClick={onClose}>
          <i className='ri-close-line' />
        </IconButton>
      </div>

      <div className='flex flex-col gap-4 p-5 overflow-y-auto'>
        {isLoading || !data ? (
          <>
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={120} />
          </>
        ) : (
          <>
            <div className='flex items-start gap-3'>
              {data.imageUrl ? (
                <img
                  src={data.imageUrl}
                  alt=''
                  width={72}
                  height={72}
                  className='rounded object-contain'
                  style={{ width: 72, height: 72, background: 'var(--mui-palette-action-hover)' }}
                />
              ) : null}
              <div className='min-is-0'>
                <Typography variant='body2' color='text.secondary'>
                  {data.companyName} · {data.companySlug}
                </Typography>
                <div className='flex flex-wrap gap-1 mbs-2'>
                  {(data.tags || []).map(t => (
                    <Chip key={t.id} size='small' label={t.name} variant='tonal' />
                  ))}
                </div>
              </div>
            </div>

            <TextField label='Nombre' size='small' fullWidth value={form.name} onChange={setField('name')} />
            <div className='flex gap-3'>
              <TextField label='Marca' size='small' fullWidth value={form.brand} onChange={setField('brand')} />
              <TextField label='Modelo' size='small' fullWidth value={form.model} onChange={setField('model')} />
            </div>
            <TextField
              label='Categoría'
              size='small'
              fullWidth
              value={form.category}
              onChange={setField('category')}
            />
            <TextField label='SKU' size='small' fullWidth value={form.externalSku} onChange={setField('externalSku')} />
            <TextField
              label='URL producto'
              size='small'
              fullWidth
              value={form.productUrl}
              onChange={setField('productUrl')}
            />
            <TextField
              label='URL imagen'
              size='small'
              fullWidth
              value={form.imageUrl}
              onChange={setField('imageUrl')}
            />

            <Divider />
            <Typography variant='subtitle2'>Especificaciones</Typography>
            <TextField
              label='Procesador'
              size='small'
              fullWidth
              value={form.processor}
              onChange={setField('processor')}
            />
            <TextField label='GPU' size='small' fullWidth value={form.gpu} onChange={setField('gpu')} />
            <div className='flex gap-3'>
              <TextField label='RAM' size='small' fullWidth value={form.ram} onChange={setField('ram')} />
              <TextField label='Storage' size='small' fullWidth value={form.storage} onChange={setField('storage')} />
            </div>
            <TextField label='Pantalla' size='small' fullWidth value={form.screen} onChange={setField('screen')} />
            <TextField
              label='SO'
              size='small'
              fullWidth
              value={form.operatingSystem}
              onChange={setField('operatingSystem')}
            />

            <Divider />
            <Typography variant='subtitle2'>Precios ({data.prices?.length || 0})</Typography>
            {(data.prices || []).length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                Sin precios registrados
              </Typography>
            ) : (
              (data.prices || []).slice(0, 8).map(p => (
                <div key={p.id} className='flex items-center justify-between gap-2'>
                  <Typography variant='body2'>
                    {p.currency} {Number(p.price).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {p.available ? 'Disponible' : 'Sin stock'}
                    {p.stockQty != null ? ` · ${p.stockQty}` : ''}
                  </Typography>
                </div>
              ))
            )}
          </>
        )}
      </div>

      <div className='flex items-center justify-between gap-2 p-5 border-bs mt-auto'>
        <Button variant='outlined' color='secondary' onClick={onClose}>
          Cerrar
        </Button>
        <LoadingButton
          variant='contained'
          loading={updateState.isLoading}
          onClick={handleSave}
          disabled={isLoading || !data}
        >
          Guardar
        </LoadingButton>
      </div>
    </Drawer>
  )
}

export default ProductDrawer
