'use client'

import { useEffect, useState } from 'react'

import { clearAuthSession, getStoredUser } from '@/utils/authSession'

export function useAuthUser() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
    setReady(true)

    const onStorage = () => setUser(getStoredUser())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const refresh = () => setUser(getStoredUser())

  const logout = () => {
    clearAuthSession()
    setUser(null)
  }

  return {
    user,
    ready,
    isAdmin: user?.role === 'ADMIN',
    refresh,
    logout
  }
}
