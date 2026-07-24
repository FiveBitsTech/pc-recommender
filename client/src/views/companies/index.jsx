'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Skeleton from '@mui/material/Skeleton'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { useAuthUser } from '@/hooks/useAuthUser'

import CompanyCard from './components/CompanyCard'
import CompanyDetails from './components/CompanyDetails'
import CompanyDrawerForm from './components/CompanyDrawerForm'
import CompanyEmptyState from './components/CompanyEmptyState'
import CompanyTable from './components/CompanyTable'
import { useClientPagination } from './hooks/useClientPagination'
import { useCompaniesClient } from './hooks/useCompaniesClient'

const BodyRowsSkeleton = () => (
  <div className='flex flex-col gap-2 px-6 pb-6'>
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} variant='rounded' animation='wave' height={52} />
    ))}
  </div>
)

const CompaniesPage = () => {
  const router = useRouter()
  const { ready, isAdmin } = useAuthUser()
  const client = useCompaniesClient({ skip: !isAdmin })
  const pager = useClientPagination(client.items, { defaultPageSize: 10 })
  const [gridView, setGridView] = useState(false)

  useEffect(() => {
    if (ready && !isAdmin) router.replace('/home')
  }, [ready, isAdmin, router])

  useEffect(() => {
    pager.resetPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.search])

  // Cookie SSR ya da isAdmin; no vaciar la vista con return null / skeleton de página
  if (ready && !isAdmin) return null

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
            <div>
              <Typography variant='h4' className='mbe-1'>
                WebApps - Empresas
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Tiendas a scrapear y su configuración
                {client.isLoading ? '' : ` (${pager.total})`}
              </Typography>
            </div>
            <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto'>
              <TextField
                size='small'
                placeholder='Buscar empresa...'
                value={client.search}
                onChange={e => client.setSearch(e.target.value)}
                className='sm:is-[260px] max-sm:flex-1'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' />
                    </InputAdornment>
                  )
                }}
              />
              <Tooltip title={gridView ? 'Vista tabla' : 'Vista grid'} placement='top'>
                <IconButton
                  color='primary'
                  onClick={() => setGridView(v => !v)}
                  sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}
                >
                  <i className={gridView ? 'ri-list-check' : 'ri-layout-grid-line'} />
                </IconButton>
              </Tooltip>
              <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={client.openCreate}>
                Nueva empresa
              </Button>
            </div>
          </CardContent>

          {client.error ? (
            <Alert
              severity='error'
              sx={{ mx: 5, mb: 3 }}
              action={
                <Button color='inherit' size='small' onClick={client.refetch}>
                  Reintentar
                </Button>
              }
            >
              {typeof client.error === 'string' ? client.error : 'No se pudo cargar empresas'}
            </Alert>
          ) : null}

          {client.isLoading ? (
            <BodyRowsSkeleton />
          ) : client.items.length === 0 ? (
            <CompanyEmptyState onCreate={client.openCreate} hasSearch={Boolean(client.search.trim())} />
          ) : gridView ? (
            <>
              <Grid container spacing={4} sx={{ px: 5, pb: 2 }}>
                {pager.pagedItems.map(item => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <CompanyCard item={item} onView={client.openDetails} onEdit={client.openEdit} />
                  </Grid>
                ))}
              </Grid>
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
          ) : (
            <>
              <CompanyTable items={pager.pagedItems} onView={client.openDetails} onEdit={client.openEdit} />
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
          )}
        </Card>
      </Grid>

      <CompanyDrawerForm
        open={client.showForm}
        form={client.form}
        formError={client.formError}
        saving={client.saving}
        generating={client.generating}
        onClose={client.closeForm}
        onChange={client.patchForm}
        onSave={client.saveCompany}
        onGenerateAi={client.generateConfigWithAi}
      />

      <CompanyDetails
        open={client.showDetails}
        company={client.selected}
        onClose={client.closeDetails}
        onEdit={client.openEdit}
      />
    </Grid>
  )
}

export default CompaniesPage
