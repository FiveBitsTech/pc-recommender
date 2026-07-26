'use client'

import { useEffect } from 'react'

import { useSettings } from '@core/hooks/useSettings'
import primaryColorConfig from '@configs/primaryColorConfig'

const C_PATH =
  'M69.5 16.8A37 37 0 1 0 69.5 62.2L56.5 54.8A22.5 22.5 0 1 1 56.5 24.2L69.5 16.8Z'

const buildFaviconHref = color => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 70 76"><path fill="${color}" fill-rule="evenodd" d="${C_PATH}"/></svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const ensureIconLink = () => {
  let link = document.querySelector("link[rel='icon'][data-cotiza-favicon='1']")

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'icon')
    link.setAttribute('type', 'image/svg+xml')
    link.setAttribute('data-cotiza-favicon', '1')
    document.head.appendChild(link)
  }

  return link
}

/** Favicon con el mismo primary que el logo (Customizer / settings). */
const DynamicFavicon = () => {
  const { settings } = useSettings()
  const color = settings?.primaryColor || primaryColorConfig[0].main

  useEffect(() => {
    const link = ensureIconLink()
    link.href = buildFaviconHref(color)
  }, [color])

  return null
}

export default DynamicFavicon
