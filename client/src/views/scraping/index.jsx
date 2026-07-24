'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Skeleton from '@mui/material/Skeleton'
import Tab from '@mui/material/Tab'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import CustomTabList from '@core/components/mui/TabList'
import { useAuthUser } from '@/hooks/useAuthUser'

import ScrapingConfigPanel from './components/ScrapingConfigPanel'
import ScrapingHistoryTable from './components/ScrapingHistoryTable'
import ScrapingSourceCard from './components/ScrapingSourceCard'
import ScrapingSourcesTable from './components/ScrapingSourcesTable'
import { useClientPagination } from './hooks/useClientPagination'
import { useScrapingClient } from './hooks/useScrapingClient'

const ScrapingPage = () => {
  const router = useRouter()
  const { ready, isAdmin } = useAuthUser()
  const client = useScrapingClient({ skip: !isAdmin })
  const [search, setSearch] = useState('')
  const [gridView, setGridView] = useState(false)
  const [tab, setTab] = useState('catalog')

  useEffect(() => {
    if (ready && !isAdmin) router.replace('/home')
  }, [ready, isAdmin, router])

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return client.cards
    return client.cards.filter(card =>
      [card.title, card.source, card.website].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    )
  }, [client.cards, search])

  const sourcesPager = useClientPagination(filteredCards, { defaultPageSize: 10 })
  const historyPager = useClientPagination(client.history, { defaultPageSize: 10 })

  useEffect(() => {
    sourcesPager.resetPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  if (ready && !isAdmin) return null

  return (
    <TabContext value={tab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <div className='flex flex-col gap-4'>
            <div>
              <Typography variant='h4' className='mbe-1'>
                Scraping
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Scrapea empresas por website / scrapeConfig
              </Typography>
            </div>
            <CustomTabList
              variant='scrollable'
              pill='true'
              color='primary'
              onChange={(_, value) => setTab(value)}
            >
              <Tab value='catalog' label='Catálogo' icon={<i className='ri-store-2-line' />} iconPosition='start' />
              <Tab
                value='config'
                label='Config scraping'
                icon={<i className='ri-settings-3-line' />}
                iconPosition='start'
              />
            </CustomTabList>
          </div>
        </Grid>

        <Grid item xs={12}>
          <TabPanel value='catalog' className='p-0'>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Card>
                  <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
                    <div>
                      <Typography variant='h5' className='mbe-1'>
                        Scraping de catálogo
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Empresas registradas · {filteredCards.length} tiendas
                      </Typography>
                    </div>
                    <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto'>
                      <TextField
                        size='small'
                        placeholder='Buscar empresa...'
                        value={search}
                        onChange={e => setSearch(e.target.value)}
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
                    </div>
                  </CardContent>

                  {client.lastResult ? (
                    <Alert
                      severity={client.lastResult.status === 'success' ? 'success' : 'info'}
                      sx={{ mx: 5, mb: 3 }}
                    >
                      Última corrida: <strong>{client.lastResult.source}</strong> ·{' '}
                      {client.lastResult.productsFound ?? 0} productos
                      {client.lastResult.persisted ? ' · guardado en BD' : ''}
                    </Alert>
                  ) : null}

                  {client.isLoading ? (
                    <div className='flex flex-col gap-3 p-6'>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} variant='rounded' animation='wave' height={56} />
                      ))}
                    </div>
                  ) : filteredCards.length === 0 ? (
                    <div className='flex flex-col items-center gap-3 py-12 px-6 text-center'>
                      <i className='ri-store-2-line' style={{ fontSize: '2.5rem', opacity: 0.35 }} />
                      <Typography variant='h6'>No hay empresas</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Registra tiendas en Empresas para poder scrapearlas aquí.
                      </Typography>
                      <Button
                        component={Link}
                        href='/companies'
                        variant='contained'
                        startIcon={<i className='ri-add-line' />}
                      >
                        Ir a WebApps - Empresas
                      </Button>
                    </div>
                  ) : gridView ? (
                    <>
                      <Grid container spacing={4} sx={{ px: 5, pb: 2 }}>
                        {sourcesPager.pagedItems.map(card => (
                          <Grid item xs={12} sm={6} md={4} key={card.companyId}>
                            <ScrapingSourceCard
                              card={card}
                              running={client.runningCompanyId === card.companyId}
                              disabled={client.isRunning && client.runningCompanyId !== card.companyId}
                              onRun={client.runCompany}
                            />
                          </Grid>
                        ))}
                      </Grid>
                      <TablePagination
                        component='div'
                        className='border-bs'
                        count={sourcesPager.total}
                        page={sourcesPager.page}
                        rowsPerPage={sourcesPager.pageSize}
                        rowsPerPageOptions={sourcesPager.pageSizeOptions}
                        onPageChange={sourcesPager.handlePageChange}
                        onRowsPerPageChange={sourcesPager.handlePageSizeChange}
                        labelRowsPerPage='Por página:'
                      />
                    </>
                  ) : (
                    <>
                      <ScrapingSourcesTable
                        items={sourcesPager.pagedItems}
                        runningCompanyId={client.runningCompanyId}
                        isRunning={client.isRunning}
                        onRun={client.runCompany}
                      />
                      <TablePagination
                        component='div'
                        className='border-bs'
                        count={sourcesPager.total}
                        page={sourcesPager.page}
                        rowsPerPage={sourcesPager.pageSize}
                        rowsPerPageOptions={sourcesPager.pageSizeOptions}
                        onPageChange={sourcesPager.handlePageChange}
                        onRowsPerPageChange={sourcesPager.handlePageSizeChange}
                        labelRowsPerPage='Por página:'
                      />
                    </>
                  )}
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent className='pbe-0'>
                    <Typography variant='h5' className='mbe-1'>
                      Historial
                    </Typography>
                    <Typography variant='body2' color='text.secondary' className='mbe-4'>
                      Resultados de las últimas ejecuciones ({historyPager.total})
                    </Typography>
                  </CardContent>
                  <ScrapingHistoryTable items={historyPager.pagedItems} />
                  {historyPager.total > 0 ? (
                    <TablePagination
                      component='div'
                      className='border-bs'
                      count={historyPager.total}
                      page={historyPager.page}
                      rowsPerPage={historyPager.pageSize}
                      rowsPerPageOptions={historyPager.pageSizeOptions}
                      onPageChange={historyPager.handlePageChange}
                      onRowsPerPageChange={historyPager.handlePageSizeChange}
                      labelRowsPerPage='Por página:'
                    />
                  ) : null}
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value='config' className='p-0'>
            <ScrapingConfigPanel />
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default ScrapingPage
