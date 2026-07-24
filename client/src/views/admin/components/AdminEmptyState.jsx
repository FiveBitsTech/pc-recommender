'use client'

import Typography from '@mui/material/Typography'

/** Empty state centrado (mismo tamaño en todos los paneles admin). */
const AdminEmptyState = ({ icon = 'ri-inbox-line', title, description }) => (
  <div className='flex flex-col items-center justify-center gap-2 py-12 px-6 text-center' style={{ minHeight: 187 }}>
    <i className={icon} style={{ fontSize: '2rem', opacity: 0.35 }} />
    <Typography variant='h6'>{title}</Typography>
    <Typography variant='body2' color='text.secondary'>
      {description}
    </Typography>
  </div>
)

export default AdminEmptyState
