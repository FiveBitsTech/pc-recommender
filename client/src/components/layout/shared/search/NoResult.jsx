// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

const noResultData = [
  { label: 'Inicio', href: '/home', icon: 'ri-home-smile-line' },
  { label: 'Armar PC', href: '/builder', icon: 'ri-cpu-line' },
  { label: 'Empresas', href: '/companies', icon: 'ri-building-line' }
]

const NoResult = ({ searchValue, setOpen }) => {
  return (
    <div className='flex items-center justify-center grow flex-wrap plb-14 pli-16 overflow-y-auto overflow-x-hidden bs-full'>
      <div className='flex flex-col items-center'>
        <i className='ri-file-forbid-line text-[64px] mbe-2.5' />
        <p className='text-lg font-medium leading-[1.55556] mbe-11'>{`Sin resultados para "${searchValue}"`}</p>
        <p className='text-[15px] leading-[1.4667] mbe-4 text-textDisabled'>Prueba buscando</p>
        <ul className='flex flex-col gap-4'>
          {noResultData.map((item, index) => (
            <li key={index} className='flex items-center'>
              <Link
                href={item.href}
                className='flex items-center gap-2 hover:text-primary focus-visible:text-primary focus-visible:outline-0'
                onClick={() => setOpen(false)}
              >
                <i className={classnames(item.icon, 'text-xl')} />
                <p className='text-[15px] leading-[1.4667] truncate'>{item.label}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default NoResult
