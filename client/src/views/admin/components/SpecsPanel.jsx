'use client'

import { useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'

import tableStyles from '@core/styles/table.module.css'
import { useGetAdminCompaniesQuery } from '@/views/companies/api/companiesApi'

import { useGetAdminSpecsQuery } from '../api/adminCatalogApi'
import {
  useDebouncedValue,
  useResetPageOnFilter,
  useServerPagination
} from '../hooks/useServerPagination'
import AdminBodyGate from './AdminBodyGate'
import AdminEmptyState from './AdminEmptyState'
import AdminPanelHeader from './AdminPanelHeader'

const SpecsPanel = ({ skip }) => {
  const [search, setSearch] = useState('')
  const [companyId, setCompanyId] = useState('')
  const pager = useServerPagination({ defaultPageSize: 15 })
  const debouncedSearch = useDebouncedValue(search)
  const { data: companiesData } = useGetAdminCompaniesQuery(undefined, { skip })

  const queryArgs = useMemo(
    () => ({
      q: debouncedSearch.trim() || undefined,
      companyId: companyId ? Number(companyId) : undefined,
      page: pager.page,
      pageSize: pager.pageSize
    }),
    [debouncedSearch, companyId, pager.page, pager.pageSize]
  )

  useResetPageOnFilter(pager.resetPage, debouncedSearch, companyId)

  const { data, isLoading } = useGetAdminSpecsQuery(queryArgs, { skip })
  const companies = companiesData?.items ?? []
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const filteredEmpty = Boolean(debouncedSearch || companyId)

  return (
    <Card>
      <AdminPanelHeader
        title='Especificaciones'
        subtitle={isLoading ? '…' : `${total} fichas técnicas`}
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
                {items.map(item => (
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
  )
}

export default SpecsPanel
