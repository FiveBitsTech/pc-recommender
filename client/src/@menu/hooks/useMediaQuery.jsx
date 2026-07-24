'use client'

// React Imports
import { useEffect, useState } from 'react'

const readViewportMatch = breakpoint => {
  if (typeof window === 'undefined' || !breakpoint || breakpoint === 'always') {
    return breakpoint === 'always'
  }

  // Preferir el snapshot beforeInteractive (pasalasfijas) para alinear con CSS del primer paint
  const attr = document.documentElement.getAttribute('data-nav-viewport')

  if (attr === 'mobile') return true
  if (attr === 'desktop') return false

  return window.matchMedia(`(max-width: ${breakpoint})`).matches
}

const useMediaQuery = breakpoint => {
  // SSR y primer render: false (desktop). El script + CSS cubren móvil antes de hidratar.
  const [matches, setMatches] = useState(breakpoint === 'always')

  useEffect(() => {
    if (breakpoint && breakpoint !== 'always') {
      const media = window.matchMedia(`(max-width: ${breakpoint})`)
      const next = readViewportMatch(breakpoint)

      if (next !== matches) {
        setMatches(next)
      }

      const listener = () => setMatches(media.matches)

      window.addEventListener('resize', listener)

      return () => window.removeEventListener('resize', listener)
    }
  }, [matches, breakpoint])

  return matches
}

export default useMediaQuery
