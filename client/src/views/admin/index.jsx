'use client'

import { useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import Typography from '@mui/material/Typography'

import { useAuthUser } from '@/hooks/useAuthUser'

import AdminMenuLayout from './layout/AdminMenuLayout'
import { adminNavData } from './utils/admin-menu-config'

const AdminPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { ready, isAdmin } = useAuthUser()
  const tabFromUrl = searchParams.get('tab')
  const initialTab = adminNavData.some(t => t.id === tabFromUrl) ? tabFromUrl : 'productos'
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (ready && !isAdmin) router.replace('/home')
  }, [ready, isAdmin, router])

  useEffect(() => {
    if (adminNavData.some(t => t.id === tabFromUrl)) setActiveTab(tabFromUrl)
  }, [tabFromUrl])

  const onTabChange = id => {
    setActiveTab(id)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/admin?tab=${id}`)
    }
  }

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
