// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'

// Util Imports
import { getThemeCookieState } from '@core/utils/serverHelpers'

const Layout = async props => {
  const { children } = props

  const direction = 'ltr'
  const { mode, settingsCookie, systemMode } = await getThemeCookieState()

  return (
    <Providers direction={direction} mode={mode} settingsCookie={settingsCookie} systemMode={systemMode}>
      <BlankLayout systemMode={systemMode}>{children}</BlankLayout>
    </Providers>
  )
}

export default Layout
