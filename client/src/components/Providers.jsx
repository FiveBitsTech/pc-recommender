// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'
import StoreProvider from '@/store/StoreProvider'
import AppReactToastify from '@/libs/styles/AppReactToastify'
import DynamicFavicon from '@components/DynamicFavicon'
import SyncNavShellAttributes from '@components/SyncNavShellAttributes'
import { AuthUserProvider } from '@/hooks/useAuthUser'

/**
 * Síncrono: el tema ya se leyó en el layout del segmento (patrón Manyas / Materio).
 * Evita otra suspensión RSC por `await getMode()` aquí dentro → menos pestañeo del shell.
 */
const Providers = ({ children, direction, mode, settingsCookie, systemMode, initialIsAdmin = false }) => {
  const defaultCollapsed = settingsCookie?.layout === 'collapsed'

  return (
    <VerticalNavProvider defaultCollapsed={defaultCollapsed}>
      <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
        <ThemeProvider direction={direction} systemMode={systemMode}>
          <AuthUserProvider initialIsAdmin={initialIsAdmin}>
            <SyncNavShellAttributes />
            <DynamicFavicon />
            <StoreProvider>
              {children}
              <AppReactToastify direction={direction} hideProgressBar />
            </StoreProvider>
          </AuthUserProvider>
        </ThemeProvider>
      </SettingsProvider>
    </VerticalNavProvider>
  )
}

export default Providers
