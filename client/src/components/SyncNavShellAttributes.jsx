'use client'

import { useLayoutEffect } from 'react'

import { useSettings } from '@core/hooks/useSettings'

/** Mantiene data-nav-collapsed alineado con settings (SSR + toggles del customizer). */
const SyncNavShellAttributes = () => {
  const { settings } = useSettings()

  useLayoutEffect(() => {
    const root = document.documentElement

    if (settings.layout === 'collapsed') {
      root.setAttribute('data-nav-collapsed', '')
    } else {
      root.removeAttribute('data-nav-collapsed')
    }
  }, [settings.layout])

  return null
}

export default SyncNavShellAttributes
