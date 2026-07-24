const Logo = props => {
  return (
    <svg width='1em' height='1em' viewBox='2 2 70 76' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <defs>
        <path
          id='cotizaC'
          fillRule='evenodd'
          d='M69.5 16.8A37 37 0 1 0 69.5 62.2L56.5 54.8A22.5 22.5 0 1 1 56.5 24.2L69.5 16.8Z'
        />
        <mask id='cotizaCMask' maskUnits='userSpaceOnUse'>
          <use href='#cotizaC' fill='white' />
        </mask>
      </defs>

      <use href='#cotizaC' fill='currentColor' />

      <g mask='url(#cotizaCMask)'>
        <path d='M5 39.5A37 37 0 0 1 69.5 16.8L5 39.5Z' fill='white' fillOpacity='0.2' />
        <path d='M5 39.5A37 37 0 0 0 69.5 62.2L5 39.5Z' fill='white' fillOpacity='0.3' />
        <path opacity='0.077704' d='M5 24L23 39.5V50L5 32Z' fill='black' />
      </g>
    </svg>
  )
}

export default Logo
