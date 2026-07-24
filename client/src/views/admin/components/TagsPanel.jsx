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

import { useDeleteAdminTagMutation, useGetAdminTagsQuery } from '../api/adminCatalogApi'
import AdminBodyGate from './AdminBodyGate'
import AdminEmptyState from './AdminEmptyState'
import AdminPanelHeader from './AdminPanelHeader'

const TagsPanel = ({ skip }) => {
  const [search, setSearch] = useState('')
  const [companyId, setCompanyId] = useState('')
  const { data: companiesData } = useGetAdminCompaniesQuery(undefined, { skip })
  const { data, isLoading } = useGetAdminTagsQuery(undefined, { skip })
  const [deleteTag, deleteState] = useDeleteAdminTagMutation()
  const [deleteId, setDeleteId] = useState(null)
  const companies = companiesData?.items ?? []

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (data?.items ?? []).filter(tag => {
      if (!q) return true
      return String(tag.name || '')
        .toLowerCase()
        .includes(q)
    })
  }, [data?.items, search])

  const pager = useClientPagination(items, { defaultPageSize: 15 })

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteTag(deleteId).unwrap()
      notificationSuccesMessage('Tag eliminado')
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
          title='Etiquetas'
          subtitle={isLoading ? '…' : `Etiquetas y conteo de relaciones (${items.length})`}
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
              icon='ri-price-tag-3-line'
              title={search ? 'Sin resultados' : 'Sin etiquetas'}
              description={
                search ? 'Prueba otro término.' : 'Corré un scraping para poblar el catálogo.'
              }
            />
          }
        >
          <>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Productos</th>
                    <th className='text-center'>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pager.pagedItems.map(tag => (
                    <tr key={tag.id}>
                      <td>
                        <Typography className='font-medium' color='text.primary'>
                          {tag.name}
                        </Typography>
                      </td>
                      <td>
                        <Typography variant='body2'>{tag.productCount}</Typography>
                      </td>
                      <td>
                        <div className='flex justify-center'>
                          <Tooltip title='Eliminar etiqueta'>
                            <IconButton size='small' color='error' onClick={() => setDeleteId(tag.id)}>
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
        <DialogTitle>¿Eliminar etiqueta?</DialogTitle>
        <DialogContent>
          <DialogContentText>Se eliminará la etiqueta y sus relaciones con productos.</DialogContentText>
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

export default TagsPanel
