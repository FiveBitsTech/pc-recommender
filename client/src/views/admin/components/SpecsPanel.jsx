'use client'

import { useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'

import tableStyles from '@core/styles/table.module.css'
import { useGetAdminCompaniesQuery } from '@/views/companies/api/companiesApi'
import { useClientPagination } from '@/views/scraping/hooks/useClientPagination'

import { useGetAdminSpecsQuery } from '../api/adminCatalogApi'
import AdminBodyGate from './AdminBodyGate'
import AdminEmptyState from './AdminEmptyState'
import AdminPanelHeader from './AdminPanelHeader'

const SpecsPanel = ({ skip }) => {
  const [search, setSearch] = useState('')
  const [companyId, setCompanyId] = useState('')
  const { data: companiesData } = useGetAdminCompaniesQuery(undefined, { skip })
  const { data, isLoading } = useGetAdminSpecsQuery(undefined, { skip })
  const companies = companiesData?.items ?? []

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    const companyName = companies.find(c => String(c.id) === companyId)?.name
    return (data?.items ?? []).filter(item => {
      if (companyName && item.companyName !== companyName) return false
      if (!q) return true
      return [item.productName, item.companyName, item.processor, item.gpu, item.ram]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    })
  }, [data?.items, search, companyId, companies])

  const pager = useClientPagination(items, { defaultPageSize: 15 })
  const filteredEmpty = Boolean(search || companyId)

  return (
    <Card>
      <AdminPanelHeader
        title='Especificaciones'
        subtitle={isLoading ? '…' : `${items.length} fichas técnicas`}
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
            icon='ri-cpu-line'
            title={filteredEmpty ? 'Sin resultados' : 'Sin especificaciones'}
            description={
              filteredEmpty ? 'Prueba otro término o empresa.' : 'Corré un scraping para poblar el catálogo.'
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
                  <th>CPU</th>
                  <th>GPU</th>
                  <th>RAM</th>
                  <th>Storage</th>
                  <th>Pantalla</th>
                  <th>SO</th>
                </tr>
              </thead>
              <tbody>
                {pager.pagedItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <Typography className='font-medium' color='text.primary'>
                        {item.productName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {item.companyName}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>{item.processor || '—'}</Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>{item.gpu || '—'}</Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>{item.ram || '—'}</Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>{item.storage || '—'}</Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>{item.screen || '—'}</Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>{item.operatingSystem || '—'}</Typography>
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
  )
}

export default SpecsPanel
