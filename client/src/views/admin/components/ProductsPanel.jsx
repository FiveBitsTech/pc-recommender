'use client'

import { useMemo, useState } from 'react'

import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'

import tableStyles from '@core/styles/table.module.css'
import {
  notificationErrorMessage,
  notificationSuccesMessage
} from '@/components/ToastNotification'
import { useGetAdminCompaniesQuery } from '@/views/companies/api/companiesApi'
import { useClientPagination } from '@/views/scraping/hooks/useClientPagination'

import {
  useDeleteAdminProductMutation,
  useGetAdminProductsQuery
} from '../api/adminCatalogApi'
import AdminBodyGate from './AdminBodyGate'
import AdminEmptyState from './AdminEmptyState'
import AdminPanelHeader from './AdminPanelHeader'
import ProductDrawer from './ProductDrawer'

const formatPrice = item => {
  const p = item?.latestPrice
  if (!p) return '—'
  return `${p.currency || 'PEN'} ${Number(p.price).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
}

const ProductsPanel = ({ skip }) => {
  const [search, setSearch] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data: companiesData } = useGetAdminCompaniesQuery(undefined, { skip })
  const queryArgs = useMemo(
    () => ({
      q: search.trim() || undefined,
      companyId: companyId ? Number(companyId) : undefined
    }),
    [search, companyId]
  )
  const { data, isLoading, isFetching } = useGetAdminProductsQuery(queryArgs, { skip })
  const [deleteProduct, deleteState] = useDeleteAdminProductMutation()

  const items = data?.items ?? []
  const pager = useClientPagination(items, { defaultPageSize: 10 })
  const companies = companiesData?.items ?? []

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteProduct(deleteId).unwrap()
      notificationSuccesMessage('Producto eliminado')
      setDeleteId(null)
      if (selectedId === deleteId) setSelectedId(null)
    } catch (err) {
      const msg = Array.isArray(err?.data?.message)
        ? err.data.message.join(', ')
        : err?.data?.message || err?.error || 'No se pudo eliminar'
      notificationErrorMessage(msg)
    }
  }

  return (
    <>
      <Card>
        <AdminPanelHeader
          title='Productos scrapeados'
          subtitle={`${items.length} en catálogo${isFetching && !isLoading ? ' · actualizando…' : ''}`}
          search={search}
          onSearchChange={setSearch}
          companyId={companyId}
          onCompanyChange={setCompanyId}
          companies={companies}
        />

        <AdminBodyGate
          isLoading={isLoading}
          isEmpty={items.length === 0}
          empty={
            <AdminEmptyState
              icon='ri-box-3-line'
              title={search || companyId ? 'Sin resultados' : 'Sin productos'}
              description={
                search || companyId
                  ? 'Prueba otro término o empresa.'
                  : 'Corré un scraping para poblar el catálogo.'
              }
            />
          }
        >
          <>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Empresa</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Tags</th>
                    <th className='text-center'>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pager.pagedItems.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className='flex items-center gap-3'>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=''
                              width={40}
                              height={40}
                              className='rounded object-contain'
                              style={{ width: 40, height: 40, background: 'var(--mui-palette-action-hover)' }}
                            />
                          ) : (
                            <div
                              className='flex items-center justify-center rounded'
                              style={{
                                width: 40,
                                height: 40,
                                background: 'var(--mui-palette-action-hover)'
                              }}
                            >
                              <i className='ri-image-line' />
                            </div>
                          )}
                          <div className='min-is-0'>
                            <Typography color='text.primary' className='font-medium truncate max-is-[280px]'>
                              {item.name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {[item.brand, item.model].filter(Boolean).join(' · ') || `ID ${item.id}`}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Typography variant='body2'>{item.companyName}</Typography>
                      </td>
                      <td>
                        <Typography variant='body2'>{item.category || '—'}</Typography>
                      </td>
                      <td>
                        <Typography variant='body2'>{formatPrice(item)}</Typography>
                      </td>
                      <td>
                        <div className='flex flex-wrap gap-1'>
                          {(item.tags || []).slice(0, 2).map(t => (
                            <Chip key={t.id} size='small' label={t.name} variant='tonal' />
                          ))}
                          {(item.tags || []).length > 2 ? (
                            <Chip size='small' label={`+${item.tags.length - 2}`} variant='outlined' />
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className='flex items-center justify-center gap-1'>
                          <Tooltip title='Ver / editar'>
                            <IconButton size='small' onClick={() => setSelectedId(item.id)}>
                              <i className='ri-eye-line' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Eliminar'>
                            <IconButton size='small' color='error' onClick={() => setDeleteId(item.id)}>
                              <i className='ri-delete-bin-line' />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              component='div'
              className='border-bs'
              count={pager.total}
              page={pager.page}
              rowsPerPage={pager.pageSize}
              rowsPerPageOptions={pager.pageSizeOptions}
              onPageChange={pager.handlePageChange}
              onRowsPerPageChange={pager.handlePageSizeChange}
              labelRowsPerPage='Por página:'
            />
          </>
        </AdminBodyGate>
      </Card>

      <ProductDrawer open={Boolean(selectedId)} productId={selectedId} onClose={() => setSelectedId(null)} />

      <Dialog open={Boolean(deleteId)} onClose={() => !deleteState.isLoading && setDeleteId(null)}>
        <DialogTitle>¿Eliminar producto?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se borrarán precios, specs, tags y relaciones asociadas. No se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleteState.isLoading}>
            Cancelar
          </Button>
          <Button color='error' variant='contained' onClick={handleDelete} disabled={deleteState.isLoading}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProductsPanel
