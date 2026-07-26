import { getContrastRatio } from '@mui/material/styles'

/**
 * Preferir texto blanco en primary/botones.
 * Negro solo si el blanco no contrasta de verdad con el fondo.
 * (MUI usa threshold 3 por defecto y pinta negro en teals/medios).
 */
export const getPreferredContrastText = (background, { minWhiteContrast = 2.2 } = {}) => {
  if (!background) return '#fff'

  try {
    const whiteRatio = getContrastRatio(background, '#FFFFFF')
    if (whiteRatio >= minWhiteContrast) return '#FFFFFF'

    const blackRatio = getContrastRatio(background, '#111111')
    return blackRatio > whiteRatio ? '#111111' : '#FFFFFF'
  } catch {
    return '#FFFFFF'
  }
}

export default getPreferredContrastText
