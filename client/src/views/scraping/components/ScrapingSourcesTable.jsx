'use client'

import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { LoadingButton } from '@mui/lab'

import tableStyles from '@core/styles/table.module.css'
import CompanyLogo from '@/views/companies/components/CompanyLogo'

const ScrapingSourcesTable = ({ items, runningCompanyId, isRunning, onRun }) => (
  <div className='overflow-x-auto'>
    <table className={tableStyles.table}>
      <thead>
        <tr>
          <th>Empresa</th>
          <th>Slug</th>
          <th>Sitio</th>
          <th>Config</th>
          <th>Estado</th>
          <th className='text-center'>Acción</th>
        </tr>
      </thead>
      <tbody>
        {items.map(card => {
          const running = runningCompanyId === card.companyId

          return (
            <tr key={card.companyId}>
              <td>
                <div className='flex items-center gap-3'>
                  <CompanyLogo
                    src={card.logoUrl}
                    alt={card.title}
                    size={36}
                    darkBg={card.logoDarkBg}
                    bgColor={card.logoBgColor}
                  />
                  <div className='flex flex-col'>
                    <Typography color='text.primary' className='font-medium'>
                      {card.title}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {card.description}
                    </Typography>
                  </div>
                </div>
              </td>
              <td>
                <Typography variant='body2'>{card.source}</Typography>
              </td>
              <td>
                {card.website ? (
                  <Typography
                    component='a'
                    href={card.website}
                    target='_blank'
                    rel='noreferrer'
                    variant='body2'
                    color='primary'
                  >
                    {card.website.replace(/^https?:\/\//, '')}
                  </Typography>
                ) : (
                  <Typography variant='body2' color='text.disabled'>
                    —
                  </Typography>
                )}
              </td>
              <td>
                <Chip
                  size='small'
                  variant='tonal'
                  color={card.hasScrapeConfig ? 'info' : card.website ? 'default' : 'warning'}
                  label={card.hasScrapeConfig ? 'scrapeConfig' : card.website ? 'Website' : 'Sin config'}
                />
              </td>
              <td>
                <Chip
                  size='small'
                  variant='tonal'
                  color={card.active ? 'success' : 'default'}
                  label={card.active ? 'Activa' : 'Inactiva'}
                />
              </td>
              <td>
                <div className='flex items-center justify-center'>
                  <LoadingButton
                    size='small'
                    variant='contained'
                    loading={running}
                    disabled={(isRunning && !running) || !card.canRun}
                    startIcon={<i className='ri-play-circle-line' />}
                    onClick={() => onRun(card.companyId)}
                  >
                    {running ? 'Scrapeando...' : 'Ejecutar'}
                  </LoadingButton>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

export default ScrapingSourcesTable
