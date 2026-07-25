'use client'

import { useEffect, useState } from 'react'

/**
 * Evita flash de skeleton cuando la API responde muy rápido.
 * Solo marca `true` si `active` sigue true tras `delayMs`.
 */
export const useDelayedFlag = (active, delayMs = 250) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) {
      setVisible(false)
      return undefined
    }

    const id = window.setTimeout(() => setVisible(true), delayMs)
    return () => window.clearTimeout(id)
  }, [active, delayMs])

  return visible
}

export default useDelayedFlag
