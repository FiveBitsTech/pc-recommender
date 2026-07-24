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
import {
  notificationErrorMessage,
  notificationSuccesMessage
} from '@/components/ToastNotification'
import { useGetAdminCompaniesQuery } from '@/views/companies/api/companiesApi'
import { useClientPagination } from '@/views/scraping/hooks/useClientPagination'

import {
  useDeleteAdminRecommendationMutation,
  useGetAdminRecommendationsQuery
} from '../api/adminCatalogApi'
import AdminBodyGate from './AdminBodyGate'
import AdminEmptyState from './AdminEmptyState'
import AdminPanelHeader from './AdminPanelHeader'

const RecommendationsPanel = ({ skip }) => {
  const [search, setSearch] = useState('')
  const [companyId, setCompanyId] = useState('')
  const { data: companiesData } = useGetAdminCompaniesQuery(undefined, { skip })
  const { data, isLoading } = useGetAdminRecommendationsQuery(undefined, { skip })
  const [deleteRec, deleteState] = useDeleteAdminRecommendationMutation()
  const [deleteId, setDeleteId] = useState(null)
  const companies = companiesData?.items ?? []

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (data?.items ?? []).filter(item => {
      if (!q) return true
      return [item.productName, item.reason, String(item.requirementId)]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    })
  }, [data?.items, search])

  const pager = useClientPagination(items, { defaultPageSize: 15 })

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
          subtitle={isLoading ? '…' : `${items.length} recomendaciones persistidas`}
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
              icon='ri-thumb-up-line'
              title={search ? 'Sin resultados' : 'Sin recomendaciones'}
              description={search ? 'Prueba otro término.' : 'Aún no hay recomendaciones persistidas.'}
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
                  {pager.pagedItems.map(item => (
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
