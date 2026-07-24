'use client'

import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

import tableStyles from '@core/styles/table.module.css'

const formatDate = value => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'medium'
    })
  } catch {
    return String(value)
  }
}

const ScrapingHistoryTable = ({ items }) => {
  if (!items?.length) {
    return (
      <Typography variant='body2' color='text.secondary' sx={{ py: 4, textAlign: 'center' }}>
        Aún no hay ejecuciones. Lanza un scraping para ver el historial aquí.
      </Typography>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th>Fuente</th>
            <th>Estado</th>
            <th>Productos</th>
            <th>Fecha</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>
                <Typography color='text.primary' className='font-medium'>
                  {item.source}
                </Typography>
              </td>
              <td>
                <Chip
                  size='small'
                  variant='tonal'
                  color={item.status === 'success' ? 'success' : 'error'}
                  label={item.status}
                />
              </td>
              <td>
                <Typography variant='body2'>{item.productsFound ?? 0}</Typography>
              </td>
              <td>
                <Typography variant='body2'>{formatDate(item.executedAt)}</Typography>
              </td>
              <td>
                <Typography variant='body2' color='text.secondary'>
                  {item.errorMessage || '—'}
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ScrapingHistoryTable
