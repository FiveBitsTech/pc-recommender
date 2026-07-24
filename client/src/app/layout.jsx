// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import Script from 'next/script'
import 'react-perfect-scrollbar/dist/css/styles.css'

// Util Imports
import { getThemeCookieState } from '@core/utils/serverHelpers'
import { buildInitNavViewportScript } from '@/lib/viewport/buildInitNavViewportScript'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'Cotiza - IA',
  description:
    'PC-Cotiza IA: cotización guiada y recomendación neutral de PCs y componentes según tu presupuesto y necesidades.'
}

const RootLayout = async props => {
  const { children } = props

  const { settingsCookie, systemMode } = await getThemeCookieState()
  const direction = 'ltr'
  const navCollapsed = settingsCookie?.layout === 'collapsed'

  return (
    <html
      id='__next'
      lang='es'
      dir={direction}
      suppressHydrationWarning
      {...(navCollapsed ? { 'data-nav-collapsed': '' } : {})}
    >
      <body className='flex is-full min-bs-full flex-auto flex-col' suppressHydrationWarning>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        <Script
          id='nav-viewport-init'
          strategy='beforeInteractive'
          dangerouslySetInnerHTML={{ __html: buildInitNavViewportScript() }}
        />
        {children}
      </body>
    </html>
  )
}

export default RootLayout
