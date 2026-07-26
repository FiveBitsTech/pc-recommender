/** Ítems de navegación compartidos (vertical + horizontal). */

export const perfilMenuItems = [
  { href: '/home', icon: 'ri-home-smile-line', label: 'Inicio' },
  { href: '/requirements', icon: 'ri-robot-2-line', label: 'Nueva cotización' },
  { href: '/history', icon: 'ri-history-line', label: 'Mis cotizaciones' },
  { href: '/comparisons', icon: 'ri-scales-3-line', label: 'Comparaciones' },
  { href: '/builder', icon: 'ri-tools-line', label: 'Armador de PC' },
  { href: '/favorites', icon: 'ri-heart-line', label: 'Favoritos' }
]

/** Solo admin — operaciones de plataforma (Ajustes al final) */
export const panelMenuItems = [
  {
    href: '/companies',
    icon: 'ri-store-2-line',
    label: 'Empresas',
    suffix: { label: 'webs', color: 'error' }
  },
  { href: '/scraping', icon: 'ri-radar-line', label: 'Scraping' },
  { href: '/admin', icon: 'ri-database-2-line', label: 'Administración' },
  { href: '/settings', icon: 'ri-settings-3-line', label: 'Ajustes' }
]
