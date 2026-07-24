'use client'

import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import tableStyles from '@core/styles/table.module.css'

const CompanyTable = ({ items, onView, onEdit }) => (
  <div className='overflow-x-auto'>
    <table className={tableStyles.table}>
      <thead>
        <tr>
          <th>Empresa</th>
          <th>Slug</th>
          <th>Sitio</th>
          <th>Estado</th>
          <th>Scrape</th>
          <th className='text-center'>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => {
          const hasScrape = Boolean(item.scrapeConfig && Object.keys(item.scrapeConfig).length)

          return (
            <tr key={item.id}>
              <td>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center rounded bg-actionHover' style={{ width: 36, height: 36 }}>
                    {item.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.logoUrl} alt='' width={28} height={28} style={{ objectFit: 'contain' }} />
                    ) : (
                      <i className='ri-store-2-line' />
                    )}
                  </div>
                  <Typography color='text.primary' className='font-medium'>
                    {item.name}
                  </Typography>
                </div>
              </td>
              <td>
                <Typography variant='body2'>{item.slug}</Typography>
              </td>
              <td>
                {item.website ? (
                  <Typography
                    component='a'
                    href={item.website}
                    target='_blank'
                    rel='noreferrer'
                    variant='body2'
                    color='primary'
                  >
                    {item.website.replace(/^https?:\/\//, '')}
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
                  label={item.active ? 'Activa' : 'Inactiva'}
                  color={item.active ? 'success' : 'default'}
                  variant='tonal'
                />
              </td>
              <td>
                <Chip
                  size='small'
                  label={hasScrape ? 'Configurado' : 'Sin config'}
                  color={hasScrape ? 'info' : 'warning'}
                  variant='tonal'
                />
              </td>
              <td>
                <div className='flex items-center justify-center gap-1'>
                  <Tooltip title='Ver detalle'>
                    <IconButton size='small' onClick={() => onView(item)}>
                      <i className='ri-eye-line' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Editar'>
                    <IconButton size='small' onClick={() => onEdit(item)}>
                      <i className='ri-edit-box-line' />
                    </IconButton>
                  </Tooltip>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)

export default CompanyTable
