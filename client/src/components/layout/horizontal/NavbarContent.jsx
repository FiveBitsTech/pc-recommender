'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import Logo from '@components/layout/shared/Logo'
import NavSearch from '@components/layout/shared/search'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const shortcuts = [
  {
    url: '/home',
    icon: 'ri-home-smile-line',
    title: 'Inicio',
    subtitle: 'Panel principal'
  },
  {
    url: '/builder',
    icon: 'ri-cpu-line',
    title: 'Armar PC',
    subtitle: 'Cotización guiada'
  },
  {
    url: '/comparisons',
    icon: 'ri-scales-3-line',
    title: 'Comparaciones',
    subtitle: 'Vs. componentes'
  },
  {
    url: '/favorites',
    icon: 'ri-heart-line',
    title: 'Favoritos',
    subtitle: 'Guardados'
  },
  {
    url: '/companies',
    icon: 'ri-building-line',
    title: 'WebApps',
    subtitle: 'Admin tiendas'
  },
  {
    url: '/settings',
    icon: 'ri-settings-4-line',
    title: 'Preferencias',
    subtitle: 'Tu cuenta'
  }
]

const notifications = [
  {
    avatarImage: '/images/avatars/2.png',
    title: 'Cotiza lista 🎉',
    subtitle: 'Tu recomendación de PC está lista',
    time: 'hace 1h',
    read: false
  },
  {
    title: 'Nueva tienda',
    subtitle: 'Se agregó una empresa al catálogo',
    time: 'hace 12h',
    read: false
  },
  {
    avatarImage: '/images/avatars/3.png',
    title: 'Scraping completado',
    subtitle: 'Se actualizaron precios de componentes',
    time: 'hoy, 8:26 AM',
    read: true
  },
  {
    avatarIcon: 'ri-bar-chart-line',
    avatarColor: 'info',
    title: 'Reporte mensual',
    subtitle: 'Resumen de cotizaciones generado',
    time: '24 abr, 10:30 AM',
    read: true
  },
  {
    avatarText: 'PC',
    avatarColor: 'success',
    title: 'Build aprobada 🚀',
    subtitle: 'Tu configuración pasó compatibilidad',
    time: '17 feb, 12:17 PM',
    read: true
  },
  {
    avatarIcon: 'ri-mail-line',
    avatarColor: 'error',
    title: 'Nuevo mensaje',
    subtitle: 'Tienes un mensaje pendiente',
    time: '6 ene, 1:48 PM',
    read: true
  }
]

const NavbarContent = () => {
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
    >
      <div className='flex items-center gap-4'>
        <NavToggle />
        {!isBreakpointReached && <Logo />}
      </div>

      <div className='flex items-center'>
        <NavSearch />
        <ModeDropdown />
        <ShortcutsDropdown shortcuts={shortcuts} />
        <NotificationsDropdown notifications={notifications} />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
