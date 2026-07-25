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

import { useDeleteAdminComparisonMutation, useGetAdminComparisonsQuery } from '../api/adminCatalogApi'
import {
  useDebouncedValue,
  useResetPageOnFilter,
  useServerPagination
} from '../hooks/useServerPagination'
import AdminBodyGate from './AdminBodyGate'
import AdminEmptyState from './AdminEmptyState'
import AdminPanelHeader from './AdminPanelHeader'

const ComparisonsPanel = ({ skip }) => {
  const [search, setSearch] = useState('')
  const pager = useServerPagination({ defaultPageSize: 15 })
  const debouncedSearch = useDebouncedValue(search)
  const [deleteComparison, deleteState] = useDeleteAdminComparisonMutation()
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

  const { data, isLoading } = useGetAdminComparisonsQuery(queryArgs, { skip })
  const items = data?.items ?? []
  const total = data?.total ?? 0

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteComparison(deleteId).unwrap()
      notificationSuccesMessage('Comparación eliminada')
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
          title='Comparaciones'
          subtitle={isLoading ? '…' : `${total} comparaciones guardadas`}
          search={search}
          onSearchChange={setSearch}
          showCompany={false}
        />

        <AdminBodyGate
          isLoading={isLoading}
          isEmpty={items.length === 0}
          empty={
            <AdminEmptyState
              icon='ri-scales-3-line'
              title={debouncedSearch ? 'Sin resultados' : 'Sin comparaciones'}
              description={debouncedSearch ? 'Prueba otro término.' : 'Aún no hay comparaciones guardadas.'}
            />
          }
        >
          <>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>Producto A</th>
                    <th>Producto B</th>
                    <th>Análisis</th>
                    <th>Fecha</th>
                    <th className='text-center'>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <Typography className='font-medium' color='text.primary'>
                          {item.productOneName}
                        </Typography>
                      </td>
                      <td>
                        <Typography className='font-medium' color='text.primary'>
                          {item.productTwoName}
                        </Typography>
                      </td>
                      <td>
                        <Typography variant='body2' className='truncate max-is-[280px]'>
                          {item.analysis || '—'}
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
        <DialogTitle>¿Eliminar comparación?</DialogTitle>
        <DialogContent>
          <DialogContentText>Se borrará el registro de comparaciones.</DialogContentText>
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

export default ComparisonsPanel
