'use client'

import { createContext, useMemo, useState } from 'react'

// Config Imports
import themeConfig from '@configs/themeConfig'
import primaryColorConfig from '@configs/primaryColorConfig'

// Hook Imports
import { useObjectCookie } from '@core/hooks/useObjectCookie'

export const SettingsContext = createContext(null)

const buildInitialSettings = (modeFromProps) => ({
  mode: modeFromProps || themeConfig.mode,
  skin: themeConfig.skin,
  semiDark: themeConfig.semiDark,
  layout: themeConfig.layout,
  navbarContentWidth: themeConfig.navbar.contentWidth,
  contentWidth: themeConfig.contentWidth,
  footerContentWidth: themeConfig.footer.contentWidth,
  primaryColor: primaryColorConfig[0].main
})

const resolveSettings = (cookieFromServer, modeFromProps) => {
  const base = buildInitialSettings(modeFromProps)

  if (cookieFromServer && JSON.stringify(cookieFromServer) !== '{}') {
    return { ...base, ...cookieFromServer }
  }

  return base
}

export const SettingsProvider = props => {
  // Snapshot del servidor: misma semilla en SSR y primer paint del cliente (anti-hydration mismatch)
  const serverSnapshot = useMemo(
    () => resolveSettings(props.settingsCookie, props.mode),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [, updateSettingsCookie] = useObjectCookie(themeConfig.settingsCookieName, serverSnapshot)

  const [_settingsState, _updateSettingsState] = useState(serverSnapshot)

  const updateSettings = (settings, options) => {
    const { updateCookie = true } = options || {}

    _updateSettingsState(prev => {
      const newSettings = { ...prev, ...settings }

      if (updateCookie) updateSettingsCookie(newSettings)

      return newSettings
    })
  }

  const updatePageSettings = settings => {
    updateSettings(settings, { updateCookie: false })

    return () => updateSettings(serverSnapshot, { updateCookie: false })
  }

  const resetSettings = () => {
    updateSettings(buildInitialSettings(props.mode))
  }

  const isSettingsChanged = useMemo(
    () => JSON.stringify(buildInitialSettings(props.mode)) !== JSON.stringify(_settingsState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_settingsState]
  )

  return (
    <SettingsContext.Provider
      value={{
        settings: _settingsState,
        updateSettings,
        isSettingsChanged,
        resetSettings,
        updatePageSettings
      }}
    >
      {props.children}
    </SettingsContext.Provider>
  )
}
