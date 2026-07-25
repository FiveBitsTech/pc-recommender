'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'pc-cotiza-show-perfil-menu'
const EVENT_NAME = 'pc-cotiza:show-perfil-menu'

export const getShowPerfilMenu = () => {
  if (typeof window === 'undefined') return false

  return localStorage.getItem(STORAGE_KEY) === '1'
}

export const setShowPerfilMenu = value => {
  const next = Boolean(value)

  localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }))
}

/** Menú Perfil (usuario): oculto por defecto; el admin lo activa en Ajustes. */
export const useShowPerfilMenu = () => {
  const [showPerfilMenu, setShow] = useState(false)

  useEffect(() => {
    setShow(getShowPerfilMenu())

    const onCustom = event => setShow(Boolean(event.detail))

    const onStorage = event => {
      if (event.key === STORAGE_KEY || event.key == null) setShow(getShowPerfilMenu())
    }

    window.addEventListener(EVENT_NAME, onCustom)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(EVENT_NAME, onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const toggleShowPerfilMenu = value => {
    const next = typeof value === 'boolean' ? value : !showPerfilMenu

    setShowPerfilMenu(next)
    setShow(next)
  }

  return { showPerfilMenu, toggleShowPerfilMenu }
}
