'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'

import { useAuthUser } from '@/hooks/useAuthUser'

import AdminMenuLayout from './layout/AdminMenuLayout'
import { adminNavData } from './utils/admin-menu-config'

const tabFromLocation = () => {
  if (typeof window === 'undefined') return 'productos'

  const tab = new URLSearchParams(window.location.search).get('tab')

  return adminNavData.some(t => t.id === tab) ? tab : 'productos'
}

const AdminPage = () => {
  const router = useRouter()
  const { ready, isAdmin } = useAuthUser()

  // Tab inicial fijo en SSR/hidratación; sync con ?tab= tras montar (sin useSearchParams → sin Suspense vacío).
  const [activeTab, setActiveTab] = useState('productos')

  useEffect(() => {
    if (ready && !isAdmin) router.replace('/home')
  }, [ready, isAdmin, router])

  useEffect(() => {
    setActiveTab(tabFromLocation())
  }, [])

  const onTabChange = id => {
    setActiveTab(id)

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/admin?tab=${id}`)
    }
  }

  // Cookie SSR ya da isAdmin; no vaciar shell con return null
  if (ready && !isAdmin) return null

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <Typography variant='h4' className='mbe-1'>
          Administración
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Supervisar y mantener el catálogo
        </Typography>
      </div>

      <AdminMenuLayout activeTab={activeTab} onTabChange={onTabChange} skip={!isAdmin} />
    </div>
  )
}

export default AdminPage
