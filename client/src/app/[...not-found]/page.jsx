// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import NotFound from '@views/NotFound'

// Util Imports
import { getThemeCookieState } from '@core/utils/serverHelpers'

const NotFoundPage = async () => {
  const direction = 'ltr'
  const { mode, settingsCookie, systemMode } = await getThemeCookieState()
  const serverMode = mode === 'system' ? systemMode : mode

  return (
    <Providers direction={direction} mode={mode} settingsCookie={settingsCookie} systemMode={systemMode}>
      <BlankLayout systemMode={systemMode}>
        <NotFound mode={serverMode} />
      </BlankLayout>
    </Providers>
  )
}

export default NotFoundPage
