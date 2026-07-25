'use client'

import { useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import tableStyles from '@core/styles/table.module.css'
import { notificationErrorMessage, notificationSuccesMessage } from '@/components/ToastNotification'

import { useDeleteAdminRecommendationMutation, useGetAdminRecommendationsQuery } from '../api/adminCatalogApi'
import {
  useDebouncedValue,
  useResetPageOnFilter,
  useServerPagination
} from '../hooks/useServerPagination'
import AdminBodyGate from './AdminBodyGate'
import AdminEmptyState from './AdminEmptyState'
import AdminPanelHeader from './AdminPanelHeader'

const RecommendationsPanel = ({ skip }) => {
  const [search, setSearch] = useState('')
  const pager = useServerPagination({ defaultPageSize: 15 })
  const debouncedSearch = useDebouncedValue(search)
  const [deleteRec, deleteState] = useDeleteAdminRecommendationMutation()
  const [deleteId, setDeleteId] = useState(null)

  const queryArgs = useMemo(
    () => ({
      q: debouncedSearch.trim() || undefined,
      page: pager.page,
      pageSize: pager.pageSize
    }),
    [debouncedSearch, pager.page, pager.pageSize]
  )

  useResetPageOnFilter(pager.resetPage, debouncedSearch)

  const { data, isLoading } = useGetAdminRecommendationsQuery(queryArgs, { skip })
  const items = data?.items ?? []
  const total = data?.total ?? 0

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteRec(deleteId).unwrap()
      notificationSuccesMessage('Recomendación eliminada')
      setDeleteId(null)
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
          title='Recomendaciones'
          subtitle={isLoading ? '…' : `${total} recomendaciones persistidas`}
          search={search}
          onSearchChange={setSearch}
          showCompany={false}
        />

        <AdminBodyGate
          isLoading={isLoading}
          isEmpty={items.length === 0}
          empty={
            <AdminEmptyState
              icon='ri-thumb-up-line'
              title={debouncedSearch ? 'Sin resultados' : 'Sin recomendaciones'}
              description={debouncedSearch ? 'Prueba otro término.' : 'Aún no hay recomendaciones persistidas.'}
            />
          }
        >
          <>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Requirement</th>
                    <th>Score</th>
                    <th>Razón</th>
                    <th>Fecha</th>
                    <th className='text-center'>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <Typography className='font-medium' color='text.primary'>
                          {item.productName}
                        </Typography>
                      </td>
                      <td>
                        <Typography variant='body2'>#{item.requirementId}</Typography>
                      </td>
                      <td>
                        <Typography variant='body2'>{Number(item.score).toFixed(2)}</Typography>
                      </td>
                      <td>
                        <Typography variant='body2' className='truncate max-is-[240px]'>
                          {item.reason || '—'}
                        </Typography>
                      </td>
                      <td>
                        <Typography variant='body2' color='text.secondary'>
                          {item.createdAt ? new Date(item.createdAt).toLocaleString('es-PE') : '—'}
                        </Typography>
                      </td>
                      <td>
                        <div className='flex justify-center'>
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
              count={total}
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

      <Dialog open={Boolean(deleteId)} onClose={() => !deleteState.isLoading && setDeleteId(null)}>
        <DialogTitle>¿Eliminar recomendación?</DialogTitle>
        <DialogContent>
          <DialogContentText>Se borrará el registro de recommendations.</DialogContentText>
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

export default RecommendationsPanel
