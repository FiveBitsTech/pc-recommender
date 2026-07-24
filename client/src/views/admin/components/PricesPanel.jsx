'use client'

import { useMemo, useState } from 'react'

import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'

import tableStyles from '@core/styles/table.module.css'
import { useGetAdminCompaniesQuery } from '@/views/companies/api/companiesApi'
import { useClientPagination } from '@/views/scraping/hooks/useClientPagination'

import { useGetAdminPricesQuery } from '../api/adminCatalogApi'
import AdminBodyGate from './AdminBodyGate'
import AdminEmptyState from './AdminEmptyState'
import AdminPanelHeader from './AdminPanelHeader'

const PricesPanel = ({ skip }) => {
  const [search, setSearch] = useState('')
  const [companyId, setCompanyId] = useState('')
  const { data: companiesData } = useGetAdminCompaniesQuery(undefined, { skip })
  const { data, isLoading } = useGetAdminPricesQuery(undefined, { skip })
  const companies = companiesData?.items ?? []

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    const companyName = companies.find(c => String(c.id) === companyId)?.name
    return (data?.items ?? []).filter(item => {
      if (companyName && item.companyName !== companyName) return false
      if (!q) return true
      return [item.productName, item.companyName, String(item.id)]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    })
  }, [data?.items, search, companyId, companies])

  const pager = useClientPagination(items, { defaultPageSize: 15 })
  const filteredEmpty = Boolean(search || companyId)

  return (
    <Card>
      <AdminPanelHeader
        title='Precios'
        subtitle={isLoading ? '…' : `${items.length} registros de precio`}
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
            icon='ri-money-dollar-circle-line'
            title={filteredEmpty ? 'Sin resultados' : 'Sin precios'}
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
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Empresa</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {pager.pagedItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <Typography variant='body2'>{item.id}</Typography>
                    </td>
                    <td>
                      <Typography className='font-medium' color='text.primary'>
                        {item.productName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        product #{item.productId}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2'>{item.companyName}</Typography>
                    </td>
                    <td>
                      <Chip
                        size='small'
                        color={item.available ? 'success' : 'default'}
                        variant='tonal'
                        label={`${item.currency} ${Number(item.price).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                      />
                    </td>
                    <td>
                      <Typography variant='body2'>
                        {item.available ? 'Sí' : 'No'}
                        {item.stockQty != null ? ` · ${item.stockQty}` : ''}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant='body2' color='text.secondary'>
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleString('es-PE') : '—'}
                      </Typography>
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

export default PricesPanel
