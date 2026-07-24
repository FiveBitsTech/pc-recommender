'use client'

import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react'

import { clearAuthSession, getStoredUser } from '@/utils/authSession'

const AuthUserContext = createContext({
  user: null,
  ready: false,
  isAdmin: false,
  refresh: () => {},
  logout: () => {}
})

export function AuthUserProvider({ children, initialIsAdmin = false }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    setUser(getStoredUser())
    setReady(true)

    const onStorage = () => setUser(getStoredUser())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => {
    const resolvedAdmin = ready ? user?.role === 'ADMIN' : initialIsAdmin

    return {
      user,
      ready,
      isAdmin: Boolean(resolvedAdmin),
      refresh: () => setUser(getStoredUser()),
      logout: () => {
        clearAuthSession()
        setUser(null)
      }
    }
  }, [user, ready, initialIsAdmin])

  return <AuthUserContext.Provider value={value}>{children}</AuthUserContext.Provider>
}

export function useAuthUser() {
  return useContext(AuthUserContext)
}
