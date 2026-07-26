'use client'

const DEFAULT_LOGO_BG = '#3a3541'

const CompanyLogo = ({ src, alt = '', size = 36, imgSize, darkBg = false, bgColor }) => {
  const iconPx = imgSize ?? Math.round(size * 0.78)
  const color = typeof bgColor === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(bgColor.trim())
    ? bgColor.trim()
    : DEFAULT_LOGO_BG
  const useBg = Boolean(src && (darkBg || bgColor))

  return (
    <div
      className='flex items-center justify-center rounded'
      style={{
        width: size,
        height: size,
        backgroundColor: useBg ? color : 'var(--mui-palette-action-hover)',
        padding: useBg ? 4 : 0,
        boxSizing: 'border-box'
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={iconPx}
          height={iconPx}
          style={{ objectFit: 'contain', display: 'block', maxWidth: '100%', maxHeight: '100%' }}
        />
      ) : (
        <i className='ri-store-2-line' style={{ fontSize: Math.round(size * 0.45) }} />
      )}
    </div>
  )
}

export default CompanyLogo
export { DEFAULT_LOGO_BG }
