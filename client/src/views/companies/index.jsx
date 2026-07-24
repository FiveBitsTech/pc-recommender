'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { useAuthUser } from '@/hooks/useAuthUser'

import CompanyDetails from './components/CompanyDetails'
import CompanyDrawerForm from './components/CompanyDrawerForm'
import CompanyEmptyState from './components/CompanyEmptyState'
import CompanySkeleton from './components/CompanySkeleton'
import CompanyTable from './components/CompanyTable'
import { useCompaniesClient } from './hooks/useCompaniesClient'

const CompaniesPage = () => {
  const router = useRouter()
  const { ready, isAdmin } = useAuthUser()
  const client = useCompaniesClient({ skip: !ready || !isAdmin })

  useEffect(() => {
    if (ready && !isAdmin) router.replace('/home')
  }, [ready, isAdmin, router])

  if (!ready || !isAdmin) return null

  if (client.isLoading && client.total === 0) {
    return <CompanySkeleton />
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
            <div>
              <Typography variant='h4' className='mbe-1'>
                Empresas
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Tiendas a scrapear y su configuración ({client.total})
              </Typography>
            </div>
            <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto'>
              <TextField
                size='small'
                placeholder='Buscar empresa...'
                value={client.search}
                onChange={e => client.setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' />
                    </InputAdornment>
                  )
                }}
              />
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

          {client.items.length === 0 ? (
            <CompanyEmptyState onCreate={client.openCreate} hasSearch={Boolean(client.search.trim())} />
          ) : (
            <CompanyTable items={client.items} onView={client.openDetails} onEdit={client.openEdit} />
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
