'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useAuthUser } from '@/hooks/useAuthUser'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

// Flujo app (user y también admin)
const perfilMenuItems = [
  { href: '/home', icon: 'ri-home-smile-line', label: 'Home' },
  { href: '/requirements', icon: 'ri-robot-2-line', label: 'Nueva cotización' },
  { href: '/history', icon: 'ri-history-line', label: 'Mis cotizaciones' },
  { href: '/comparisons', icon: 'ri-scales-3-line', label: 'Comparaciones' },
  { href: '/builder', icon: 'ri-tools-line', label: 'Armador de PC' },
  { href: '/favorites', icon: 'ri-heart-line', label: 'Favoritos' },
  { href: '/settings', icon: 'ri-settings-3-line', label: 'Configuración' }
]

// Solo admin
const panelMenuItems = [{ href: '/companies', icon: 'ri-store-2-line', label: 'Empresas' }]

const VerticalMenu = ({ scrollMenu }) => {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { isAdmin } = useAuthUser()

  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 10 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {isAdmin ? (
          <MenuSection label='Panel'>
            {panelMenuItems.map(item => (
              <MenuItem key={`panel-${item.href}`} href={item.href} icon={<i className={item.icon} />}>
                {item.label}
              </MenuItem>
            ))}
          </MenuSection>
        ) : null}

        <MenuSection label='Perfil'>
          {perfilMenuItems.map(item => (
            <MenuItem key={`perfil-${item.href}`} href={item.href} icon={<i className={item.icon} />}>
              {item.label}
            </MenuItem>
          ))}
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
