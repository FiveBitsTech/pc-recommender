'use client'

import Skeleton from '@mui/material/Skeleton'

/** Skeleton del cuerpo; misma altura que AdminEmptyState. */
const AdminTableSkeleton = ({ rows = 3 } = {}) => (
  <div className='flex flex-col justify-center gap-2 px-6 pb-6' style={{ minHeight: 187 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} variant='rounded' animation='wave' height={40} />
    ))}
  </div>
)

export default AdminTableSkeleton
