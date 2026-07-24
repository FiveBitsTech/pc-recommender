'use client'

import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const CompanySkeleton = () => (
  <Card>
    <CardContent className='flex flex-col gap-4'>
      <Skeleton variant='text' width={220} height={36} />
      <Skeleton variant='rounded' height={48} />
      <Box className='flex flex-col gap-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant='rounded' height={52} />
        ))}
      </Box>
    </CardContent>
  </Card>
)

export default CompanySkeleton
